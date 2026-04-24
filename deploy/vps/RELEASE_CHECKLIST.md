# Maataa v0.1 Private-Alpha Release Checklist

All items below are hard launch gates. Any unchecked item is a no-go.

## Baseline

- [ ] `pnpm --filter @maataa/maataa-ui typecheck`
- [ ] `pnpm --filter @maataa/maataa-ui build`
- [ ] `pnpm --filter @maataa/maataa-ui test`
- [ ] `pnpm --filter @maataa/maataa-ui test:e2e`

## Security

- [ ] `MAATAA_ADMIN_TOKEN` is set in deploy env
- [ ] Protected routes reject missing/invalid admin token
- [ ] Public routes return rate-limit headers
- [ ] `/api/health` reports `security.adminAuthConfigured: true`

## Runtime Durability

- [ ] restart preserves `.maataa-data/runtime-state.json`
- [ ] restart preserves `.maataa-data/runtime-events.jsonl`
- [ ] `/api/runtime/radio` restores queue and now-playing state

## Audio / TTS Safety

- [ ] `MAATAA_TTS_MODE` is intentionally chosen
- [ ] if `MAATAA_TTS_MODE=google-translate`, this is an explicit acceptance of external TTS URLs
- [ ] `/api/radio/config` reports expected TTS mode

## Deploy

- [ ] `docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d --build`
- [ ] `APP_BASE_URL=https://<app-domain> bash deploy/vps/smoke.sh`
- [ ] `https://<app-domain>/api/health`
- [ ] `https://<app-domain>/radio-live`
- [ ] `https://<radio-domain>/live.mp3`

## Manual Acceptance

- [ ] `/proof-inspector` verifies HKD fixture correctly
- [ ] `/merkle` traversal loads and animates
- [ ] `/radio-live` loads without mixed-content issues
- [ ] admin token can trigger a controlled `POST /api/radio/next`
