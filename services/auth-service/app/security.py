from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
from secrets import token_urlsafe
from uuid import uuid4

import bcrypt
import jwt
from fastapi import HTTPException, status

from .config import Settings, get_settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=get_settings().bcrypt_rounds)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def hash_refresh_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def new_refresh_token() -> str:
    return token_urlsafe(48)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def refresh_expires_at(settings: Settings | None = None) -> datetime:
    settings = settings or get_settings()
    return utcnow() + timedelta(days=settings.refresh_token_days)


def create_access_token(user: dict, session_id: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    now = utcnow()
    permissions = user.get("permissions") or user.get("permissions_json") or []
    if isinstance(permissions, str):
        try:
            permissions = json.loads(permissions)
        except json.JSONDecodeError:
            permissions = []
    if not isinstance(permissions, list):
        permissions = []
    payload = {
        "sub": user["id"],
        "sid": session_id,
        "email": user["email"],
        "role": user["role"],
        "plan": user.get("plan", "FREE"),
        "permissions": permissions,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_token_minutes)).timestamp()),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str, settings: Settings | None = None) -> dict:
    settings = settings or get_settings()
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": ["exp", "iat", "sub", "sid"]},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc
