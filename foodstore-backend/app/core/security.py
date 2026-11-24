from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError(
            "La contraseña no puede superar los 72 bytes"
        )

    return pwd_context.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    try:
        return pwd_context.verify(password, hashed_password)
    except (ValueError, TypeError):
        return False


def create_access_token(
    user_id: int,
    expires_minutes: int | None = None
) -> str:
    settings = get_settings()

    minutos = (
        expires_minutes
        if expires_minutes is not None
        else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=minutos
    )

    payload = {
        "sub": str(user_id),
        "exp": expiration
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def decode_access_token(token: str) -> dict | None:
    settings = get_settings()

    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        return None