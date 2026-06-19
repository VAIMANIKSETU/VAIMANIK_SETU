from common.schemas import TrustData

def calculate(features):

    trust = 100

    trust -= features["distance_error"] * 1000
    trust -= features["speed_error"] * 5

    trust = max(0, min(100, trust))

    return TrustData(
        trust_score=round(trust, 2)
    )