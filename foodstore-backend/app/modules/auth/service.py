from fastapi import HTTPException

from app.core.database import session_factory
from app.core.security import (
    create_access_token,
    verify_password,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository


def autenticar_usuario(
    username: str,
    password: str
) -> str:

    with session_factory() as session:

        repositorio = UsuarioRepository(session)

        usuario = repositorio.get_by_username(
            username.strip()
        )

        if usuario is None or not verify_password(
            password,
            usuario.hashed_password
        ):
            raise HTTPException(
                status_code=401,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if usuario.disabled:
            raise HTTPException(
                status_code=400,
                detail="La cuenta está desactivada"
            )

        return create_access_token(usuario.id)