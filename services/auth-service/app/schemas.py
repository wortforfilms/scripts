from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, EmailStr, Field


class Role(StrEnum):
    USER = "USER"
    REVIEWER = "REVIEWER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=256)
    name: str = Field(min_length=1, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Role
    plan: str
    permissions: list[str]
    created_at: datetime
    updated_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class MessageResponse(BaseModel):
    message: str
