from datetime import datetime, timezone

import redis.asyncio as redis

from .config import get_settings


def create_redis() -> redis.Redis:
    return redis.from_url(get_settings().redis_url, encoding="utf-8", decode_responses=True)


def session_key(session_id: str) -> str:
    return f"auth:session:{session_id}"


async def cache_session(client: redis.Redis, session_id: str, user_id: str, expires_at: datetime) -> None:
    ttl = max(0, int((expires_at - datetime.now(timezone.utc)).total_seconds()))
    if ttl > 0:
        await client.setex(session_key(session_id), ttl, user_id)


async def get_cached_session_user(client: redis.Redis, session_id: str) -> str | None:
    return await client.get(session_key(session_id))


async def delete_cached_session(client: redis.Redis, session_id: str) -> None:
    await client.delete(session_key(session_id))
