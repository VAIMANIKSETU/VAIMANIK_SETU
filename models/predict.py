import joblib
import pandas as pd

# ==========================
# Load Models
# ==========================
xgb_model = joblib.load("models/saved_models/xgb_model.pkl")
iso_model = joblib.load("models/saved_models/iso_model.pkl")

print("Models loaded successfully!")

# ==========================
# Sample Input
# ==========================
sample_input = pd.DataFrame([{
    "timestamp": 1,
    "gps_lat": 17.3850,
    "gps_lon": 78.4867,
    "gps_alt": 550,
    "imu_lat": 17.3851,
    "imu_lon": 78.4868,
    "gps_speed": 60,
    "imu_speed": 61,
    "gps_heading": 90,
    "accel_x": 0.20,
    "accel_y": 0.10,
    "accel_z": 9.80,
    "gyro_x": 0.01,
    "gyro_y": 0.02,
    "gyro_z": 0.01,
    "barometer_alt": 548
}])

# ==========================
# Predictions
# ==========================
xgb_prediction = xgb_model.predict(sample_input)
iso_prediction = iso_model.predict(sample_input)

print("XGBoost Prediction:", xgb_prediction[0])
print("Isolation Forest Prediction:", iso_prediction[0])

# ==========================
# Final Decision
# ==========================
if xgb_prediction[0] == 1 or iso_prediction[0] == -1:
    print("🚨 ALERT: Possible GPS Spoofing Attack Detected!")
else:
    print("✅ Flight Status: Normal")