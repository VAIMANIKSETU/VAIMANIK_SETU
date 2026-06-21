from fusion.ekf import ExtendedKalmanFilter
from common.schemas import FusionData

ekf = ExtendedKalmanFilter()


def fuse(sensor_data, use_gps=True):

    ekf.predict(
        sensor_data.imu_speed,
        sensor_data.accel_x,
        sensor_data.accel_y,
        sensor_data.gyro_z
    )

    if use_gps:

        ekf.update(
            sensor_data.gps_lat,
            sensor_data.gps_lon,
            sensor_data.gps_alt,
            sensor_data.gps_heading
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