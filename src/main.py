from simulator.generator import generate
from features.extractor import extract
from fusion.fusion import fuse
from trust_engine.trust import calculate

sensor_data = generate("spoof")

feature_data = extract(sensor_data)

trust_data = calculate(feature_data)

if trust_data.gps_trusted:
    print("GPS ACCEPTED")
else:
    print("GPS REJECTED")

for i in range(5):

    fused_data = fuse(
        sensor_data,
        use_gps=trust_data.gps_trusted
    )

    print(f"\nCycle {i+1}")
    print(fused_data)

print("\nFeature Data:")
print(feature_data)

print("\nTrust Data:")
print(trust_data)