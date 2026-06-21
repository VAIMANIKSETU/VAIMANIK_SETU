import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Load sample data
df = pd.read_csv("data/sample_data.csv")

# Features and target
X = df.drop("attack_label", axis=1)
y = df["attack_label"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create model
model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)

# Save model
os.makedirs("models/saved_models", exist_ok=True)

joblib.dump(model, "models/saved_models/xgb_model.pkl")

print("XGBoost model saved successfully.")