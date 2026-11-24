from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(request: Request) -> Usuario:

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o vencido"
        )

    try:
        usuario_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    with session_factory() as session:
        usuario = session.get(Usuario, usuario_id)

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )

        return usuario


def get_current_active_user(
    usuario: Annotated[Usuario, Depends(get_current_user)]
) -> Usuario:

    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario desactivado"
        )

    return usuario


def require_role(roles: list[str]):

    def verificar_rol(
        usuario: Annotated[
            Usuario,
            Depends(get_current_active_user)
        ]
    ) -> Usuario:

        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para esta operación"
            )

        return usuario

    return verificar_rol