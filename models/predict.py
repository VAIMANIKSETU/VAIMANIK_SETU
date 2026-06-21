import pandas as pd
import numpy as np
import joblib
import torch
import torch.nn as nn

# ==============================
# Load Models & Artifacts
# ==============================
xgb_model = joblib.load("models/saved_models/xgb_model.pkl")
iso_model = joblib.load("models/saved_models/iso_model.pkl")

scaler = joblib.load("models/saved_models/autoencoder_scaler.pkl")
threshold = joblib.load("models/saved_models/autoencoder_threshold.pkl")
aircraft_encoder = joblib.load("models/saved_models/aircraft_encoder.pkl")

feature_columns = joblib.load("models/saved_models/feature_columns.pkl")


# ==============================
# Autoencoder Model
# ==============================
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


# ==============================
# Load Autoencoder
# ==============================
input_dim = len(feature_columns)
autoencoder = Autoencoder(input_dim)

autoencoder.load_state_dict(
    torch.load(
        "models/saved_models/autoencoder.pth",
        map_location=torch.device("cpu")
    )
)

autoencoder.eval()


# ==============================
# Load Sample Input
# ==============================
df = pd.read_csv("data/processed/features_60k.csv").iloc[:1]


# ==============================
# Preprocessing
# ==============================
if "aircraft" in df.columns:
    df["aircraft"] = aircraft_encoder.transform(df["aircraft"])

if "timestamp" in df.columns:
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["timestamp"] = df["timestamp"].ffill()
    df["timestamp"] = df["timestamp"].astype("int64") // 10**9


# ==============================
# Feature Engineering
# ==============================
df["speed_diff"] = abs(df["gps_speed"] - df["imu_speed"])
df["lat_diff"] = abs(df["gps_lat"] - df["imu_lat"])
df["lon_diff"] = abs(df["gps_lon"] - df["imu_lon"])
df["alt_diff"] = abs(df["gps_alt"] - df["barometer_alt"])

df["accel_magnitude"] = np.sqrt(
    df["accel_x"]**2 + df["accel_y"]**2 + df["accel_z"]**2
)

df["gyro_magnitude"] = np.sqrt(
    df["gyro_x"]**2 + df["gyro_y"]**2 + df["gyro_z"]**2
)


# ==============================
# Prepare Features
# ==============================
X = df.drop(columns=["attack_label"], errors="ignore")

# enforce training feature order
missing_cols = set(feature_columns) - set(X.columns)
if missing_cols:
    raise ValueError(f"Missing features: {missing_cols}")

X = X[feature_columns]


# ==============================
# XGBoost Prediction
# ==============================
xgb_pred = xgb_model.predict(X)[0]


# ==============================
# Isolation Forest Prediction
# ==============================
iso_pred = iso_model.predict(X)[0]


# ==============================
# Autoencoder Prediction
# ==============================
X_scaled = scaler.transform(X)

# safety check
if X_scaled.shape[1] != len(feature_columns):
    raise ValueError(
        f"Feature mismatch: expected {len(feature_columns)}, got {X_scaled.shape[1]}"
    )

X_tensor = torch.tensor(X_scaled, dtype=torch.float32)

with torch.no_grad():
    reconstructed = autoencoder(X_tensor)
    loss = torch.mean((reconstructed - X_tensor) ** 2, dim=1).mean().item()

ae_anomaly = loss > threshold


# ==============================
# Risk Engine
# ==============================
risk = 0

if xgb_pred == 1:
    risk += 40

if iso_pred == -1:
    risk += 25

if ae_anomaly:
    risk += 35


# ==============================
# Final Decision
# ==============================
print("\nXGBoost:", xgb_pred)
print("Isolation Forest:", iso_pred)
print("Autoencoder Loss:", loss)
print("Threshold:", threshold)

print("\nRISK SCORE:", risk)

if risk >= 80:
    print("🚨 CRITICAL: GPS SPOOFING ATTACK DETECTED")

elif risk >= 60:
    print("⚠ WARNING: Suspicious Activity Detected")

elif risk >= 30:
    print("⚡ Early Warning: Monitor closely")

else:
    print("✅ Normal Flight")