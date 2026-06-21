# AeroSentinel Dashboard Deployment

## Targets

- Raspberry Pi 5: supported with ARM64 Node build tooling and static `dist` serving.
- Jetson Nano: supported with static serving, leaving CUDA resources free for the trust engine backend.
- Recommended browser: Chromium kiosk mode for field consoles.

## Production Build

```bash
cd frontend
npm install
npm run build
```

Serve `frontend/dist` with Nginx, Caddy, FastAPI static files, or Flask static files.

## Environment

Create `.env.production`:

```bash
VITE_API_BASE_URL=http://<backend-host>:8000
VITE_DEMO_MODE=false
```

Keep `VITE_DEMO_MODE=true` for demos, lab testing, and offline field checks.

## API Contract

The dashboard calls these read-only endpoints:

- `GET /telemetry`
- `GET /trust`
- `GET /alerts`
- `GET /threats`
- `GET /health`

During local development, Vite proxies `/api` to `http://127.0.0.1:8000`. In production, set `VITE_API_BASE_URL` directly.

## Edge Notes

- Use static build output to minimize CPU usage on Raspberry Pi 5.
- Keep map polling at the dashboard default cadence unless the backend runs on dedicated compute.
- Prefer LAN-hosted tile caching for disconnected deployments.
- Run backend and frontend as separate containers so trust inference can restart independently.
