import pandas as pd
import numpy as np
import joblib
import os

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

# ==========================================
# Load Dataset
# ==========================================
df = pd.read_csv("data/processed/features_60k.csv")

# ==========================================
# Encode aircraft column
# ==========================================
aircraft_encoder = None

if "aircraft" in df.columns:
    aircraft_encoder = LabelEncoder()
    df["aircraft"] = aircraft_encoder.fit_transform(df["aircraft"])

# ==========================================
# Convert timestamp to numeric
# ==========================================
if "timestamp" in df.columns:

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    df["timestamp"] = df["timestamp"].ffill()

    df = df.dropna(subset=["timestamp"])

    df["timestamp"] = (
        df["timestamp"].astype("int64") // 10**9
    )

# ==========================================
# Feature Engineering
# ==========================================
df["speed_diff"] = abs(df["gps_speed"] - df["imu_speed"])

df["lat_diff"] = abs(df["gps_lat"] - df["imu_lat"])

df["lon_diff"] = abs(df["gps_lon"] - df["imu_lon"])

df["alt_diff"] = abs(df["gps_alt"] - df["barometer_alt"])

df["accel_magnitude"] = np.sqrt(
    df["accel_x"]**2 +
    df["accel_y"]**2 +
    df["accel_z"]**2
)

df["gyro_magnitude"] = np.sqrt(
    df["gyro_x"]**2 +
    df["gyro_y"]**2 +
    df["gyro_z"]**2
)

# ==========================================
# Train only on normal flights
# ==========================================
normal_df = df[df["attack_label"] == 0]

X_train = normal_df.drop("attack_label", axis=1)

print("Training samples:", len(X_train))

# ==========================================
# Create Isolation Forest
# ==========================================
model = IsolationForest(
    n_estimators=200,
    contamination=0.01,
    random_state=42
)

# ==========================================
# Train Model
# ==========================================
model.fit(X_train)

# ==========================================
# Save Model
# ==========================================
save_dir = "models/saved_models"
os.makedirs(save_dir, exist_ok=True)

joblib.dump(
    model,
    os.path.join(save_dir, "iso_model.pkl")
)

print("\nIsolation Forest model saved successfully.")