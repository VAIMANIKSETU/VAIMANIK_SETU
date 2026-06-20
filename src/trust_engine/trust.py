from common.schemas import TrustData


def calculate(features):

    trust = 100

    trust -= features.distance_error * 1000
    trust -= features.speed_error * 5
    trust -= features.altitude_error * 10
    trust -= features.heading_error * 2

    trust = max(0, min(100, trust))

    gps_trusted = trust >= 60

    attack_detected = not gps_trusted

    return TrustData(
        trust_score=round(trust, 2),
        attack_detected=attack_detected,
        gps_trusted=gps_trusted
    )