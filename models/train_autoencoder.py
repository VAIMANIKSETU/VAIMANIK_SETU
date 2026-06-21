import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import StandardScaler
import os

# Load sample data
df = pd.read_csv("data/sample_data.csv")

# Remove attack label column
X = df.drop("attack_label", axis=1)

# Normalize data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Convert to PyTorch tensor
X_tensor = torch.FloatTensor(X_scaled)


# Autoencoder Architecture
class Autoencoder(nn.Module):
    def __init__(self, input_dim):
        super(Autoencoder, self).__init__()

        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 8),
            nn.ReLU(),
            nn.Linear(8, 4)
        )

        self.decoder = nn.Sequential(
            nn.Linear(4, 8),
            nn.ReLU(),
            nn.Linear(8, input_dim)
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded


# Create model
input_dim = X_tensor.shape[1]
model = Autoencoder(input_dim)

# Loss and optimizer
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
epochs = 100

for epoch in range(epochs):

    output = model(X_tensor)

    loss = criterion(output, X_tensor)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.6f}")

# Save model
save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(save_dir, exist_ok=True)

model_path = os.path.join(save_dir, "autoencoder.pth")
torch.save(model.state_dict(), model_path)

print("Autoencoder model saved successfully.")