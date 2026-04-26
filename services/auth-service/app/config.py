from functools import lru_cache
from os import getenv


def _csv_env(name: str, default: str) -> list[str]:
    return [item.strip() for item in getenv(name, default).split(",") if item.strip()]


class Settings:
    app_name = "Maataa Auth Service"
    environment = getenv("ENVIRONMENT", "development")
    database_url = getenv("AUTH_DATABASE_URL", getenv("DATABASE_URL", "postgresql://maataa:maataa@postgres:5432/maataa"))
    redis_url = getenv("AUTH_REDIS_URL", getenv("REDIS_URL", "redis://redis:6379/0"))
    jwt_secret = getenv("AUTH_JWT_SECRET", getenv("JWT_SECRET", getenv("AUTH_SESSION_SECRET", "change-me-in-production")))
    jwt_issuer = getenv("AUTH_JWT_ISSUER", getenv("JWT_ISSUER", "maataa-auth"))
    jwt_audience = getenv("AUTH_JWT_AUDIENCE", getenv("JWT_AUDIENCE", "maataa-platform"))
    access_token_minutes = int(getenv("AUTH_ACCESS_TOKEN_MINUTES", getenv("ACCESS_TOKEN_MINUTES", "15")))
    refresh_token_days = int(getenv("AUTH_REFRESH_TOKEN_DAYS", getenv("REFRESH_TOKEN_DAYS", "30")))
    bcrypt_rounds = int(getenv("AUTH_BCRYPT_ROUNDS", "12"))
    cookie_name = getenv("AUTH_REFRESH_COOKIE_NAME", getenv("REFRESH_COOKIE_NAME", "maataa_refresh"))
    cookie_domain = getenv("AUTH_COOKIE_DOMAIN") or None
    secure_cookies = getenv("AUTH_COOKIE_SECURE", getenv("AUTH_SECURE_COOKIES", "true")).lower() == "true"
    cookie_samesite = getenv("AUTH_COOKIE_SAMESITE", "none")
    run_migrations = getenv("AUTH_RUN_MIGRATIONS", "true").lower() == "true"
    cors_origins = _csv_env(
        "AUTH_CORS_ORIGINS",
        getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://scripts.vaigyaaniq.info"),
    )
    bootstrap_admin_email = (getenv("AUTH_BOOTSTRAP_ADMIN_EMAIL") or "").strip().lower() or None


@lru_cache
def get_settings() -> Settings:
    return Settings()
