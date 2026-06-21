from simulator.generator import generate
from features.extractor import extract
from fusion.fusion import fuse
from trust_engine.trust import calculate

print("\n========== NORMAL FLIGHT ==========\n")

for i in range(10):

    sensor_data = generate("normal")

    feature_data = extract(sensor_data)

    trust_data = calculate(feature_data)

    fused_data = fuse(
        sensor_data,
        use_gps=trust_data.gps_trusted
    )

    print("GPS ACCEPTED" if trust_data.gps_trusted else "GPS REJECTED")
    print("Trust:", trust_data.trust_score)
    print("Severity:", trust_data.severity)
    print(fused_data)

print("\n========== GPS SPOOFING ATTACK ==========\n")

for i in range(10):

    sensor_data = generate("spoof")

    feature_data = extract(sensor_data)

    trust_data = calculate(feature_data)

    fused_data = fuse(
        sensor_data,
        use_gps=trust_data.gps_trusted
    )

    print(f"\nAttack Cycle {i+1}")

    print("GPS ACCEPTED" if trust_data.gps_trusted else "GPS REJECTED")
    print("Trust:", trust_data.trust_score)
    print("Severity:", trust_data.severity)
    print(fused_data)

print("\n========== FINAL STATE ==========\n")

print("Sensor Data:")
print(sensor_data)

print("\nFeature Data:")
print(feature_data)

print("\nTrust Data:")
print(trust_data)

print("\nFinal Fused State:")
print(fused_data)