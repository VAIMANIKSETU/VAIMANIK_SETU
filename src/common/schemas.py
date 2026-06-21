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
    gps_heading: float

    accel_x: float
    accel_y: float
    accel_z: float

    gyro_x: float
    gyro_y: float
    gyro_z: float


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
    gps_trusted: bool
    

@dataclass
class FusionData:
    fused_lat: float
    fused_lon: float
    fused_alt: float

    fused_vn: float
    fused_ve: float

    fused_heading: float

    