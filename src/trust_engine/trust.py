from common.schemas import TrustData


def calculate(features):
    DISTANCE_WEIGHT = 1000
    SPEED_WEIGHT = 5
    ALTITUDE_WEIGHT = 10
    HEADING_WEIGHT = 2
    GPS_RESIDUAL_WEIGHT = 500

    trust = 100

    trust -= features.distance_error * DISTANCE_WEIGHT
    trust -= features.speed_error * SPEED_WEIGHT
    trust -= features.altitude_error * ALTITUDE_WEIGHT
    trust -= features.heading_error * HEADING_WEIGHT
    trust -= features.gps_residual * GPS_RESIDUAL_WEIGHT

    trust = max(0, min(100, trust))
    gps_trusted = trust >= 60
    attack_detected = (
    trust < 60
    )
    return TrustData(
        trust_score=round(trust, 2),
        attack_detected=attack_detected,
        gps_trusted=gps_trusted
    )