import numpy as np


class ExtendedKalmanFilter:

    def __init__(self):

        # State:
        # [latitude,
        #  longitude,
        #  altitude,
        #  velocity_north,
        #  velocity_east,
        #  heading]

        self.last_residual = 0.0
        self.initialized = False

        self.x = np.array([
            [0.0],  # lat
            [0.0],  # lon
            [0.0],  # alt
            [0.0],  # vn
            [0.0],  # ve
            [0.0]   # heading
        ])

        self.P = np.eye(6)

        self.Q = np.eye(6) * 0.01

        self.R = np.eye(4) * 0.1

    def predict(
        self,
        velocity,
        gyro_z=0.0
    ):

        dt = 1.0

        # Update heading using gyro
        heading = self.x[5, 0]
        heading += gyro_z * dt

        heading = heading % 360

        self.x[5, 0] = heading

        # Convert heading to radians
        heading_rad = np.radians(heading)

        # Velocity decomposition
        vn = velocity * np.cos(heading_rad)
        ve = velocity * np.sin(heading_rad)

        self.x[3, 0] = vn
        self.x[4, 0] = ve

        # Position propagation
        self.x[0, 0] += vn * dt * 0.00001
        self.x[1, 0] += ve * dt * 0.00001

        self.P = self.P + self.Q

    def update(
        self,
        gps_lat,
        gps_lon,
        gps_alt,
        gps_heading
    ):

        # First measurement initializes filter
        if not self.initialized:

            self.x[0, 0] = gps_lat
            self.x[1, 0] = gps_lon
            self.x[2, 0] = gps_alt
            self.x[5, 0] = gps_heading

            self.initialized = True
            return

        # Measurement vector
        z = np.array([
            [gps_lat],
            [gps_lon],
            [gps_alt],
            [gps_heading]
        ])

        # Measurement model
        H = np.array([
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 1]
        ])

        # Innovation / residual
        y = z - H @ self.x

        self.last_residual = float(
            np.linalg.norm(y)
        )

        # Innovation covariance
        S = H @ self.P @ H.T + self.R

        # Kalman gain
        K = self.P @ H.T @ np.linalg.inv(S)

        # State update
        self.x = self.x + K @ y

        # Covariance update
        I = np.eye(6)

        self.P = (I - K @ H) @ self.P

    def get_state(self):
        return self.x

    def get_residual(self):
        return self.last_residual