from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field
from sqlmodel import SQLModel


class UserBase(SQLModel):
    username: str
    full_name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)


class UserPublic(UserBase):
    id: int
    role: Literal["user", "admin"]
    disabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)