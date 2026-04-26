from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

import asyncpg
from fastapi import Request

from .config import get_settings


USER_SELECT = """
SELECT id, email, name, role, plan, permissions_json, created_at, updated_at
FROM auth_users
"""


async def create_pool() -> asyncpg.Pool:
    return await asyncpg.create_pool(
        dsn=get_settings().database_url,
        min_size=1,
        max_size=10,
        command_timeout=10,
    )


async def ensure_schema(pool: asyncpg.Pool) -> None:
    if not get_settings().run_migrations:
        return
    schema_sql = Path(__file__).resolve().parents[1] / "sql" / "schema.sql"
    async with pool.acquire() as conn:
        await conn.execute(schema_sql.read_text())


@asynccontextmanager
async def db_conn(request: Request) -> AsyncIterator[asyncpg.Connection]:
    async with request.app.state.db.acquire() as conn:
        yield conn
