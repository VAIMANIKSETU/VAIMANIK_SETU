import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import joblib
import os

from sklearn.preprocessing import StandardScaler, LabelEncoder

# ==========================================
# Load Dataset
# ==========================================
df = pd.read_csv("data/processed/features_60k.csv")

# ==========================================
# Encode aircraft column
# ==========================================
if "aircraft" in df.columns:
    encoder = LabelEncoder()
    df["aircraft"] = encoder.fit_transform(df["aircraft"])

    joblib.dump(encoder, "models/saved_models/aircraft_encoder.pkl")

# ==========================================
# Timestamp processing
# ==========================================
if "timestamp" in df.columns:
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["timestamp"] = df["timestamp"].ffill()
    df = df.dropna(subset=["timestamp"])
    df["timestamp"] = df["timestamp"].astype("int64") // 10**9

# ==========================================
# Feature Engineering
# ==========================================
df["speed_diff"] = abs(df["gps_speed"] - df["imu_speed"])
df["lat_diff"] = abs(df["gps_lat"] - df["imu_lat"])
df["lon_diff"] = abs(df["gps_lon"] - df["imu_lon"])
df["alt_diff"] = abs(df["gps_alt"] - df["barometer_alt"])

df["accel_magnitude"] = np.sqrt(df["accel_x"]**2 + df["accel_y"]**2 + df["accel_z"]**2)
df["gyro_magnitude"] = np.sqrt(df["gyro_x"]**2 + df["gyro_y"]**2 + df["gyro_z"]**2)

# ==========================================
# Keep only normal flights
# ==========================================
normal_df = df[df["attack_label"] == 0]

X = normal_df.drop("attack_label", axis=1)

# 🔥 FIX: LOCK FEATURE ORDER (IMPORTANT FOR AUTOENCODER)
feature_columns = X.columns.tolist()
joblib.dump(feature_columns, "models/saved_models/feature_columns.pkl")

X = X[feature_columns]

# ==========================================
# Normalize
# ==========================================
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

joblib.dump(
    scaler,
    "models/saved_models/autoencoder_scaler.pkl"
)

# ==========================================
# Tensor
# ==========================================
X_tensor = torch.FloatTensor(X_scaled)

# ==========================================
# Autoencoder Model
# ==========================================
class Autoencoder(nn.Module):
    def __init__(self, input_dim):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 32)
        )

        self.decoder = nn.Sequential(
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.Linear(64, input_dim)
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))

# ==========================================
# Model
# ==========================================
input_dim = X_tensor.shape[1]

model = Autoencoder(input_dim)

criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# ==========================================
# Training
# ==========================================
epochs = 100

for epoch in range(epochs):
    output = model(X_tensor)
    loss = criterion(output, X_tensor)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] Loss: {loss.item():.6f}")

# ==========================================
# Threshold
# ==========================================
with torch.no_grad():
    reconstructed = model(X_tensor)
    errors = torch.mean((reconstructed - X_tensor) ** 2, dim=1)

threshold = errors.mean().item() + 3 * errors.std().item()

joblib.dump(threshold, "models/saved_models/autoencoder_threshold.pkl")

# ==========================================
# Save Model
# ==========================================
torch.save(
    model.state_dict(),
    "models/saved_models/autoencoder.pth"
)

print("\nAutoencoder model saved successfully.")
print("Input dimension:", input_dim)
print("Threshold:", threshold)