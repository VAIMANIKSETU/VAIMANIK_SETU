import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

# Load sample data
df = pd.read_csv("data/sample_data.csv")

# Remove attack label column
X = df.drop("attack_label", axis=1)

# Create Isolation Forest model
model = IsolationForest(
    n_estimators=100,
    contamination=0.1,
    random_state=42
)

# Train model
model.fit(X)

# Predict anomalies
predictions = model.predict(X)

print("Predictions:")
print(predictions)

# Create save directory
save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(save_dir, exist_ok=True)

# Save model
model_path = os.path.join(save_dir, "iso_model.pkl")
joblib.dump(model, model_path)

print("Isolation Forest model saved successfully.")