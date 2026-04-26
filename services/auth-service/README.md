# Maataa Auth Service

Production-oriented FastAPI authentication service for Maataa.

## Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

## Security Model

- Passwords are hashed with bcrypt. Plain passwords are never stored.
- Access tokens are JWTs signed with HS256 and expire after 15 minutes by default.
- Refresh tokens are opaque random values stored in an `httpOnly` cookie. Only a SHA-256 hash of the refresh token is stored in Postgres.
- Sessions are persisted in `auth_sessions` and cached in Redis as `auth:session:{session_id}` for active-session lookup.
- Logout revokes the DB session, deletes the Redis cache key, and clears the refresh cookie.
- CORS allows credentials for configured domains through `AUTH_CORS_ORIGINS`.
- `AUTH_BOOTSTRAP_ADMIN_EMAIL` creates the first configured email as `ADMIN`; all other signups default to `USER`.

## Environment

```bash
AUTH_DATABASE_URL=postgresql://maataa:maataa@postgres:5432/maataa
AUTH_REDIS_URL=redis://redis:6379/0
AUTH_JWT_SECRET=replace-with-a-long-random-secret
AUTH_JWT_ISSUER=maataa-auth
AUTH_JWT_AUDIENCE=maataa-platform
AUTH_ACCESS_TOKEN_MINUTES=15
AUTH_REFRESH_TOKEN_DAYS=30
AUTH_CORS_ORIGINS=https://scripts.vaigyaaniq.info,https://app.scripts.vaigyaaniq.info,http://localhost:3000
AUTH_COOKIE_DOMAIN=.maataa.in
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=none
AUTH_BOOTSTRAP_ADMIN_EMAIL=admin@scripts.vaigyaaniq.info
```

## Example curl

```bash
curl -i -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Maataa User","password":"correct horse battery staple"}' \
  http://localhost:8000/auth/signup
```

```bash
curl -i -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"correct horse battery staple"}' \
  http://localhost:8000/auth/login
```

```bash
ACCESS_TOKEN="paste-token-here"
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" http://localhost:8000/auth/me
```

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8000/auth/refresh
```

```bash
curl -i -b cookies.txt -c cookies.txt \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -X POST http://localhost:8000/auth/logout
```
