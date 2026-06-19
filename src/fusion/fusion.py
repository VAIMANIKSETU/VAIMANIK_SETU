from fusion.ekf import ExtendedKalmanFilter
from common.schemas import FusionData

ekf = ExtendedKalmanFilter()

def fuse(sensor_data):

    ekf.predict(sensor_data.imu_speed)

    ekf.update(
    sensor_data.gps_lat,
    sensor_data.gps_lon,
    sensor_data.gps_alt
    )

    state = ekf.get_state()

    return FusionData(
        fused_lat=float(state[0, 0]),
        fused_lon=float(state[1, 0]),
        fused_alt=float(state[2, 0]),

        fused_vn=float(state[3, 0]),
        fused_ve=float(state[4, 0]),

        fused_heading=float(state[5, 0])
    )