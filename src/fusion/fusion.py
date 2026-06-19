from common.schemas import FusionData

def fuse(sensor_data):

    fused_lat = (
        sensor_data.gps_lat +
        sensor_data.imu_lat
    ) / 2

    fused_lon = (
        sensor_data.gps_lon +
        sensor_data.imu_lon
    ) / 2

    return FusionData(
    fused_lat=fused_lat,
    fused_lon=fused_lon
)

