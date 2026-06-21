# AeroSentinel Dashboard

Production-ready React dashboard for AeroSentinel GPS spoofing and navigation trust monitoring.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Backend Integration

Set `VITE_API_BASE_URL` to your Flask or FastAPI service. The dashboard expects:

- `GET /telemetry`
- `GET /trust`
- `GET /alerts`
- `GET /threats`
- `GET /health`

If the backend is unavailable or `VITE_DEMO_MODE=true`, the dashboard automatically runs realistic local telemetry simulation.

## Edge Deployment

```bash
npm run build
npm run preview
```

For Raspberry Pi 5 and Jetson Nano, serve the generated `dist` folder with Nginx or a lightweight static server. Keep the backend API on the same LAN and set CORS to allow the dashboard origin.
