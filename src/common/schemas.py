from dataclasses import dataclass

@dataclass
class SensorData:
    gps_lat: float
    gps_lon: float
    imu_lat: float
    imu_lon: float
    gps_speed: float
    imu_speed: float
    gps_alt: float
    barometer_alt: float


@dataclass
class FeatureData:
    distance_error: float
    speed_error: float
    altitude_error: float
    heading_error: float


@dataclass
class TrustData:
    trust_score: float
    attack_detected: bool
    

@dataclass
class FusionData:
    fused_lat: float
    fused_lon: float