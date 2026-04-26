import json
from contextlib import asynccontextmanager
from typing import Annotated

import asyncpg
from fastapi import Cookie, Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import USER_SELECT, create_pool, db_conn, ensure_schema
from .redis_store import cache_session, create_redis, delete_cached_session, get_cached_session_user
from .schemas import AuthResponse, LoginRequest, MessageResponse, SignupRequest, UserResponse
from .security import (
    create_access_token,
    decode_access_token,
    hash_password,
    hash_refresh_token,
    new_id,
    new_refresh_token,
    refresh_expires_at,
    verify_password,
)


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.environment == "production" and settings.jwt_secret.startswith("change-me"):
        raise RuntimeError("JWT_SECRET or AUTH_JWT_SECRET must be set in production")
    app.state.db = await create_pool()
    app.state.redis = create_redis()
    await app.state.redis.ping()
    await ensure_schema(app.state.db)
    try:
        yield
    finally:
        await app.state.redis.aclose()
        await app.state.db.close()


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def parse_permissions(value: str) -> list[str]:
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) and all(isinstance(item, str) for item in parsed) else []
    except json.JSONDecodeError:
        return []


def public_user(row: asyncpg.Record) -> UserResponse:
    return UserResponse(
        id=row["id"],
        email=row["email"],
        name=row["name"],
        role=row["role"],
        plan=row["plan"],
        permissions=parse_permissions(row["permissions_json"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.secure_cookies,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        domain=settings.cookie_domain,
        path="/auth",
        secure=settings.secure_cookies,
        samesite=settings.cookie_samesite,
    )


async def create_session(request: Request, conn: asyncpg.Connection, user: asyncpg.Record, response: Response) -> AuthResponse:
    session_id = new_id("sess")
    refresh_token = new_refresh_token()
    expires_at = refresh_expires_at(settings)
    await conn.execute(
        """
        INSERT INTO auth_sessions (id, user_id, user_agent, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        """,
        session_id,
        user["id"],
        request.headers.get("user-agent"),
        request.client.host if request.client else None,
        expires_at,
    )
    await conn.execute(
        """
        INSERT INTO auth_refresh_tokens (id, session_id, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
        """,
        new_id("rt"),
        session_id,
        hash_refresh_token(refresh_token),
        expires_at,
    )
    await cache_session(request.app.state.redis, session_id, user["id"], expires_at)
    set_refresh_cookie(response, refresh_token)
    user_dict = dict(user)
    return AuthResponse(
        access_token=create_access_token(user_dict, session_id, settings),
        expires_in=settings.access_token_minutes * 60,
        user=public_user(user),
    )


async def get_current_user(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
) -> UserResponse:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    payload = decode_access_token(authorization.split(" ", 1)[1], settings)
    session_id = payload["sid"]
    user_id = await get_cached_session_user(request.app.state.redis, session_id)
    async with db_conn(request) as conn:
        session = await conn.fetchrow(
            """
            SELECT user_id
            FROM auth_sessions
            WHERE id = $1 AND revoked_at IS NULL AND expires_at > now()
            """,
            session_id,
        )
        if not session:
            await delete_cached_session(request.app.state.redis, session_id)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session is no longer active")
        if user_id and user_id != session["user_id"]:
            await delete_cached_session(request.app.state.redis, session_id)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session cache mismatch")
        if not user_id:
            user_id = session["user_id"]
            await cache_session(request.app.state.redis, session_id, user_id, payload_expires_at(payload))
        user = await conn.fetchrow(f"{USER_SELECT} WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    return public_user(user)


def require_roles(*roles: str):
    async def dependency(user: Annotated[UserResponse, Depends(get_current_user)]) -> UserResponse:
        elevated = user.role == "SUPER_ADMIN" and "ADMIN" in roles
        if user.role not in roles and not elevated:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user

    return dependency


def payload_expires_at(payload: dict):
    from datetime import datetime, timezone

    return datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc)


@app.get("/health")
async def health() -> dict[str, str]:
    await app.state.redis.ping()
    async with app.state.db.acquire() as conn:
        await conn.fetchval("SELECT 1")
    return {"status": "ok", "service": settings.app_name}


@app.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, request: Request, response: Response) -> AuthResponse:
    email = normalize_email(payload.email)
    role = "ADMIN" if settings.bootstrap_admin_email == email else "USER"
    async with db_conn(request) as conn:
        try:
            async with conn.transaction():
                user = await conn.fetchrow(
                    """
                    INSERT INTO auth_users (id, email, name, password_hash, password_salt, role)
                    VALUES ($1, $2, $3, $4, '', $5)
                    RETURNING id, email, name, role, plan, permissions_json, created_at, updated_at
                    """,
                    new_id("user"),
                    email,
                    payload.name.strip(),
                    hash_password(payload.password),
                    role,
                )
                account_id = new_id("acct")
                await conn.execute(
                    """
                    INSERT INTO accounts (id, name, type, plan)
                    VALUES ($1, $2, 'INDIVIDUAL', 'FREE')
                    """,
                    account_id,
                    payload.name.strip(),
                )
                await conn.execute(
                    """
                    INSERT INTO user_accounts (id, user_id, account_id, account_role, is_default)
                    VALUES ($1, $2, $3, 'OWNER', TRUE)
                    """,
                    new_id("ua"),
                    user["id"],
                    account_id,
                )
                return await create_session(request, conn, user, response)
        except asyncpg.UniqueViolationError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account already exists for this email") from exc


@app.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest, request: Request, response: Response) -> AuthResponse:
    async with db_conn(request) as conn:
        user = await conn.fetchrow(
            """
            SELECT id, email, name, role, plan, permissions_json, created_at, updated_at, password_hash
            FROM auth_users
            WHERE email = $1
            """,
            normalize_email(payload.email),
        )
        if not user or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        return await create_session(request, conn, user, response)


@app.get("/auth/me", response_model=UserResponse)
async def me(user: Annotated[UserResponse, Depends(get_current_user)]) -> UserResponse:
    return user


@app.post("/auth/refresh", response_model=AuthResponse)
async def refresh(
    request: Request,
    response: Response,
    refresh_token: Annotated[str | None, Cookie(alias=settings.cookie_name)] = None,
) -> AuthResponse:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh cookie required")
    async with db_conn(request) as conn:
        async with conn.transaction():
            row = await conn.fetchrow(
                f"""
                SELECT s.id AS session_id, s.expires_at, u.id, u.email, u.name, u.role, u.plan, u.permissions_json, u.created_at, u.updated_at
                FROM auth_refresh_tokens rt
                JOIN auth_sessions s ON s.id = rt.session_id
                JOIN auth_users u ON u.id = s.user_id
                WHERE rt.token_hash = $1
                  AND rt.revoked_at IS NULL
                  AND rt.expires_at > now()
                  AND s.revoked_at IS NULL
                  AND s.expires_at > now()
                """,
                hash_refresh_token(refresh_token),
            )
            if not row:
                clear_refresh_cookie(response)
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
            await conn.execute("UPDATE auth_refresh_tokens SET revoked_at = now() WHERE token_hash = $1", hash_refresh_token(refresh_token))
            new_token = new_refresh_token()
            expires_at = refresh_expires_at(settings)
            await conn.execute(
                """
                UPDATE auth_sessions
                SET expires_at = $1, updated_at = now()
                WHERE id = $2
                """,
                expires_at,
                row["session_id"],
            )
            await conn.execute(
                """
                INSERT INTO auth_refresh_tokens (id, session_id, token_hash, expires_at)
                VALUES ($1, $2, $3, $4)
                """,
                new_id("rt"),
                row["session_id"],
                hash_refresh_token(new_token),
                expires_at,
            )
            await cache_session(request.app.state.redis, row["session_id"], row["id"], expires_at)
            set_refresh_cookie(response, new_token)
            return AuthResponse(
                access_token=create_access_token(dict(row), row["session_id"], settings),
                expires_in=settings.access_token_minutes * 60,
                user=public_user(row),
            )


@app.post("/auth/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    refresh_token: Annotated[str | None, Cookie(alias=settings.cookie_name)] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> MessageResponse:
    session_id = None
    if authorization and authorization.lower().startswith("bearer "):
        try:
            session_id = decode_access_token(authorization.split(" ", 1)[1], settings).get("sid")
        except HTTPException:
            session_id = None
    async with db_conn(request) as conn:
        if session_id:
            await conn.execute("UPDATE auth_sessions SET revoked_at = now(), updated_at = now() WHERE id = $1", session_id)
            await conn.execute("UPDATE auth_refresh_tokens SET revoked_at = now() WHERE session_id = $1 AND revoked_at IS NULL", session_id)
            await delete_cached_session(request.app.state.redis, session_id)
        elif refresh_token:
            row = await conn.fetchrow("SELECT session_id FROM auth_refresh_tokens WHERE token_hash = $1", hash_refresh_token(refresh_token))
            if row:
                await conn.execute("UPDATE auth_sessions SET revoked_at = now(), updated_at = now() WHERE id = $1", row["session_id"])
                await conn.execute("UPDATE auth_refresh_tokens SET revoked_at = now() WHERE session_id = $1 AND revoked_at IS NULL", row["session_id"])
                await delete_cached_session(request.app.state.redis, row["session_id"])
    clear_refresh_cookie(response)
    return MessageResponse(message="Logged out")
