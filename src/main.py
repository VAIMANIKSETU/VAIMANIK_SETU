from simulator.generator import generate
from features.extractor import extract
from fusion.fusion import fuse
from trust_engine.trust import calculate

sensor_data = generate("drift")

for i in range(50):

    sensor_data = generate("drift")

    fused_data = fuse(sensor_data)

    feature_data = extract(sensor_data)

    trust_data = calculate(feature_data)

    print(
        i,
        sensor_data.gps_lat,
        trust_data.trust_score
    )

# Run EKF first
for i in range(5):

    fused_data = fuse(sensor_data)

    print(f"\nCycle {i+1}")
    print(fused_data)

# Extract features AFTER EKF
feature_data = extract(sensor_data)

print("\nFeature Data:")
print(feature_data)

# Calculate trust AFTER features
trust_data = calculate(feature_data)

if trust_data.gps_trusted:
    print("GPS ACCEPTED")
else:
    print("GPS REJECTED")

print("\nTrust Data:")
print(trust_data)