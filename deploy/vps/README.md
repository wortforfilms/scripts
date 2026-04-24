# Maataa v0.1 VPS Deploy

This deploy target ships the private-alpha UI on a VPS with:

- `maataa-ui` behind Caddy on your app domain
- `icecast` behind Caddy on a radio subdomain
- persistent runtime state in a Docker volume mounted at `/app/.maataa-data`

## 1. DNS

Create two DNS records pointing at the VPS:

- `A  APP_DOMAIN   -> <your-vps-ip>`
- `A  RADIO_DOMAIN -> <your-vps-ip>`

Example:

- `maataa.example.com`
- `radio.maataa.example.com`

## 2. Server prep

On the VPS:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

Clone the repo and prepare envs:

```bash
cp deploy/vps/.env.example deploy/vps/.env
```

Edit `deploy/vps/.env` and set:

- `APP_DOMAIN`
- `RADIO_DOMAIN`
- `ACME_EMAIL`
- `APP_BASE_URL`
- `RADIO_STREAM_URL`
- `MAATAA_ADMIN_TOKEN`

## 3. Launch

From repo root:

```bash
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d --build
```

## 4. Public URLs

- App: `https://APP_DOMAIN`
- Runtime health: `https://APP_DOMAIN/api/health`
- Radio UI: `https://APP_DOMAIN/radio-live`
- Radio mount: `https://RADIO_DOMAIN/live.mp3`

## 5. Notes on radio access

This repo now exposes the radio URL through:

- `/api/radio/config`
- `/api/radio/now-playing`
- `/radio-live`

For private-alpha, `RADIO_STREAM_URL` should point at the public stream mount served by the radio domain. If your playout source is not mounted yet, the app still deploys cleanly, but `/api/health` will report the configured stream URL rather than validating live audio bytes.

Admin-only control routes now require either `x-maataa-admin-token: $MAATAA_ADMIN_TOKEN` or `Authorization: Bearer $MAATAA_ADMIN_TOKEN`:

- `POST /api/radio/next`
- `POST /api/radio/force-play`
- `POST /api/ai-rj/feedback`
- `GET /api/ai-rj/training/export`

Safe TTS defaults are now private-alpha friendly:

- `MAATAA_TTS_MODE=disabled` keeps generated TTS tracks metadata-only by default
- `MAATAA_TTS_MODE=google-translate` explicitly enables externally generated TTS URLs
- `/api/radio/config` and `/api/health` report the active TTS mode and whether admin auth is configured

## 6. Rolling update

```bash
git pull
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d --build
```

## 7. Logs

```bash
docker compose -f deploy/vps/docker-compose.yml logs -f maataa-ui
docker compose -f deploy/vps/docker-compose.yml logs -f caddy
docker compose -f deploy/vps/docker-compose.yml logs -f icecast
```

## 8. Release Gate

Use the strict checklist in `deploy/vps/RELEASE_CHECKLIST.md` before inviting any private-alpha users.
