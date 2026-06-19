import numpy as np


class ExtendedKalmanFilter:

    def __init__(self):

        # State:
        # [latitude, longitude, altitude,
        #  velocity_north, velocity_east,
        #  heading]
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

        self.R = np.eye(3) * 0.1

    def predict(self, velocity):
        dt = 1.0
        heading = self.x[5, 0]
        vn = velocity * np.cos(heading)
        ve = velocity * np.sin(heading)

        self.x[3, 0] = vn
        self.x[4, 0] = ve

        self.x[0, 0] += vn * dt * 0.00001
        self.x[1, 0] += ve * dt * 0.00001

        self.P = self.P + self.Q

    def update(self, gps_lat, gps_lon, gps_alt):
      
      if not self.initialized:
        self.x[0, 0] = gps_lat
        self.x[1, 0] = gps_lon
        self.x[2, 0] = gps_alt

        self.initialized = True
        return
      
      z = np.array([
        [gps_lat],
        [gps_lon],
        [gps_alt]
        ])

      H = np.array([
          [1, 0, 0, 0, 0, 0],
          [0, 1, 0, 0, 0, 0],
          [0, 0, 1, 0, 0, 0]
          ])

      y = z - H @ self.x

      S = H @ self.P @ H.T + self.R

      K = self.P @ H.T @ np.linalg.inv(S)

      self.x = self.x + K @ y

      I = np.eye(6)

      self.P = (I - K @ H) @ self.P

    def get_state(self):

        return self.x