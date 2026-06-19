from simulator.generator import generate
from features.extractor import extract
from fusion.fusion import fuse
from trust_engine.trust import calculate

sensor_data = generate()

feature_data = extract(sensor_data)

fused_data = fuse(sensor_data)

trust_data = calculate(feature_data)

print("\nSensor Data:")
print(sensor_data)

print("\nFeature Data:")
print(feature_data)

print("\nFused Data:")
print(fused_data)

print("\nTrust Data:")
print(trust_data)