from common.mock_data import (
    get_normal_data,
    get_spoofed_data,
    get_drift_data
)

def generate(mode="normal"):

    if mode == "spoof":
        return get_spoofed_data()

    if mode == "drift":
        return get_drift_data()

    return get_normal_data()