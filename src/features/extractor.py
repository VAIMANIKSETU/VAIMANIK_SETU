def extract(sensor_data):

    distance_error = abs(
        sensor_data.gps_lat
        - sensor_data.imu_lat
    )

    speed_error = abs(
        sensor_data.gps_speed
        - sensor_data.imu_speed
    )

    return {
        "distance_error": distance_error,
        "speed_error": speed_error
    }