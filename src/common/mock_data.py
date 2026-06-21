from common.schemas import SensorData


def get_normal_data():
    return SensorData(
        gps_lat=17.385,
        gps_lon=78.4867,
        imu_lat=17.3851,
        imu_lon=78.4868,
        gps_speed=50,
        imu_speed=52,
        gps_alt=1200,
        barometer_alt=1198,
        gps_heading=0,
        accel_x=0.0,
        accel_y=0.0,
        accel_z=0.0,
        gyro_x=0.0,
        gyro_y=0.0,
        gyro_z=10.0
    )


def get_spoofed_data():
    return SensorData(
        gps_lat=18.385,
        gps_lon=79.4867,
        imu_lat=17.3851,
        imu_lon=78.4868,
        gps_speed=50,
        imu_speed=52,
        gps_alt=1200,
        barometer_alt=1198,
        gps_heading=0,
        accel_x=0.0,
        accel_y=0.0,
        accel_z=0.0,
        gyro_x=0.0,
        gyro_y=0.0,
        gyro_z=0.0
    )

drift_counter = 0

def get_drift_data():

    global drift_counter

    drift_counter += 1

    return SensorData(
        gps_lat=17.385 + drift_counter * 0.0002,
        gps_lon=78.4867 + drift_counter * 0.0002,

        imu_lat=17.3851,
        imu_lon=78.4868,

        gps_speed=50,
        imu_speed=52,

        gps_alt=1200,
        barometer_alt=1198,

        gps_heading=0,

        accel_x=0.0,
        accel_y=0.0,
        accel_z=0.0,

        gyro_x=0.0,
        gyro_y=0.0,
        gyro_z=0.0
    )