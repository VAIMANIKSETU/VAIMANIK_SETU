import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import StandardScaler
import joblib
import os

# =====================================
# Load Data
# =====================================
df = pd.read_csv("data/sample_data.csv")

if "attack_label" in df.columns:
    df = df.drop("attack_label", axis=1)

# =====================================
# Feature Engineering
# =====================================
df["speed_diff"] = abs(df["gps_speed"] - df["imu_speed"])
df["lat_diff"] = abs(df["gps_lat"] - df["imu_lat"])
df["lon_diff"] = abs(df["gps_lon"] - df["imu_lon"])
df["alt_diff"] = abs(df["gps_alt"] - df["barometer_alt"])

# =====================================
# Normalize
# =====================================
scaler = StandardScaler()
scaled_data = scaler.fit_transform(df)

save_dir = "models/saved_models"
os.makedirs(save_dir, exist_ok=True)

joblib.dump(scaler, f"{save_dir}/lstm_scaler.pkl")
# =====================================
# Create sequences
# =====================================
sequence_length = 3

sequences = []

for i in range(len(scaled_data) - sequence_length + 1):
    sequences.append(scaled_data[i:i + sequence_length])

sequences = np.array(sequences)

print("Scaled data shape:", scaled_data.shape)
print("Sequences shape:", sequences.shape)

# Check if sequences were created
if len(sequences) == 0:
    raise ValueError(
        "No sequences created. Increase dataset size or decrease sequence_length."
    )

X_tensor = torch.FloatTensor(sequences)

print("Tensor shape:", X_tensor.shape)


# =====================================
# LSTM Autoencoder
# =====================================
class LSTMAutoencoder(nn.Module):

    def __init__(self, n_features, hidden_size=32):

        super().__init__()

        self.encoder = nn.LSTM(
            input_size=n_features,
            hidden_size=hidden_size,
            batch_first=True
        )

        self.decoder = nn.LSTM(
            input_size=hidden_size,
            hidden_size=n_features,
            batch_first=True
        )

    def forward(self, x):

        _, (hidden, _) = self.encoder(x)

        repeated = hidden.repeat(x.size(1), 1, 1)
        repeated = repeated.permute(1, 0, 2)

        reconstructed, _ = self.decoder(repeated)

        return reconstructed


# =====================================
# Model
# =====================================
n_features = X_tensor.shape[-1]
print("Number of features:", n_features)

model = LSTMAutoencoder(n_features)

criterion = nn.MSELoss()

optimizer = optim.Adam(model.parameters(), lr=0.001)

# =====================================
# Training
# =====================================
epochs = 100

for epoch in range(epochs):

    output = model(X_tensor)

    loss = criterion(output, X_tensor)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 10 == 0:

        print(
            f"Epoch [{epoch+1}/{epochs}] Loss: {loss.item():.6f}"
        )

# =====================================
# Threshold
# =====================================
with torch.no_grad():

    reconstructed = model(X_tensor)

    errors = torch.mean(
        (reconstructed - X_tensor) ** 2,
        dim=(1, 2)
    )

threshold = errors.mean().item() + 3 * errors.std().item()

joblib.dump(
    threshold,
    f"{save_dir}/lstm_threshold.pkl"
)

# =====================================
# Save model
# =====================================
torch.save(
    model.state_dict(),
    f"{save_dir}/lstm_autoencoder.pth"
)

print("\nLSTM Autoencoder saved successfully")
print("Threshold:", threshold) autoencoder