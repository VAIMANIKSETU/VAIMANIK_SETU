from common.schemas import TrustData


def calculate(features):

    trust = 100

    trust -= features.distance_error * 50
    trust -= features.speed_error * 2
    trust -= features.altitude_error * 2
    trust -= features.heading_error * 1

    trust = max(0, min(100, trust))

    if trust >= 80:
        severity = "NORMAL"

    elif trust >= 60:
        severity = "SUSPICIOUS"

    elif trust >= 40:
        severity = "MODERATE"

    elif trust >= 20:
        severity = "SEVERE"

    else:
        severity = "CRITICAL"

    gps_trusted = trust >= 60
    attack_detected = not gps_trusted

    return TrustData(
        trust_score=round(trust, 2),
        attack_detected=attack_detected,
        gps_trusted=gps_trusted,
        severity=severity
    )