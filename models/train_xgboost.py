import pandas as pd
import numpy as np
import joblib
import os

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
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
# ==========================================
# Convert timestamp to numeric
# ==========================================
if "timestamp" in df.columns:

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    # Forward fill missing timestamps
    df["timestamp"] = df["timestamp"].ffill()

    # Remove rows that are still invalid
    df = df.dropna(subset=["timestamp"])

    # Convert datetime to Unix timestamp (seconds)
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
# Remove rows with missing values
# ==========================================
df.dropna(inplace=True)

# ==========================================
# Features and Target
# ==========================================
X = df.drop("attack_label", axis=1)
y = df["attack_label"]

# ==========================================
# Verify data types
# ==========================================
print("\nColumn Data Types:")
print(X.dtypes)

# ==========================================
# Train-Test Split
# ==========================================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ==========================================
# Create XGBoost Model
# ==========================================
model = XGBClassifier(
    n_estimators=300,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

# ==========================================
# Train Model
# ==========================================
model.fit(X_train, y_train)

# ==========================================
# Predictions
# ==========================================
y_pred = model.predict(X_test)

# ==========================================
# Evaluation
# ==========================================
accuracy = accuracy_score(y_test, y_pred)

print("\nAccuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# ==========================================
# Save Model
# ==========================================
save_dir = "models/saved_models"
os.makedirs(save_dir, exist_ok=True)

joblib.dump(
    model,
    os.path.join(save_dir, "xgb_model.pkl")
)

if aircraft_encoder is not None:
    joblib.dump(
        aircraft_encoder,
        os.path.join(save_dir, "aircraft_encoder.pkl")
    )

print("XGBoost model saved successfully.")
