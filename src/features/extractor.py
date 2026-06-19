from common.schemas import FeatureData

def extract(sensor_data):

    distance_error = abs(
        sensor_data.gps_lat -
        sensor_data.imu_lat
    )

    speed_error = abs(
        sensor_data.gps_speed -
        sensor_data.imu_speed
    )

    altitude_error = abs(
        sensor_data.gps_alt -
        sensor_data.barometer_alt
    )

    heading_error = 0  # placeholder until real heading data exists

    return FeatureData(
        distance_error=distance_error,
        speed_error=speed_error,
        altitude_error=altitude_error,
        heading_error=heading_error
    )