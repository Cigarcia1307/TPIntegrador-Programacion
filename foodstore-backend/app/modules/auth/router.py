from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import get_settings
from app.core.deps import get_current_active_user
from app.modules.auth import service
from app.modules.auth.schemas import MessageResponse
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import registrar_usuario


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


UsuarioActual = Annotated[
    Usuario,
    Depends(get_current_active_user)
]


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED
)
def register(datos: UserCreate):
    return registrar_usuario(datos)


@router.post(
    "/token",
    response_model=MessageResponse
)
def login(
    response: Response,
    datos: Annotated[
        OAuth2PasswordRequestForm,
        Depends()
    ]
):
    token = service.autenticar_usuario(
        datos.username,
        datos.password
    )

    settings = get_settings()

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return MessageResponse(
        message="Login exitoso"
    )


@router.post(
    "/logout",
    response_model=MessageResponse
)
def logout(response: Response):

    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax"
    )

    return MessageResponse(
        message="Sesión cerrada correctamente"
    )


@router.get(
    "/me",
    response_model=UserPublic
)
def consultar_sesion(usuario: UsuarioActual):
    return UserPublic.model_validate(usuario)