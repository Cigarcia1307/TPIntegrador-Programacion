from typing import Annotated

from fastapi import APIRouter, Depends, Path

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios import service


router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Administración de Usuarios"]
)


SoloAdmin = Annotated[
    Usuario,
    Depends(require_role(["admin"]))
]


@router.get(
    "",
    response_model=list[UserPublic]
)
def listar_usuarios(admin: SoloAdmin):
    return service.listar_usuarios()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic
)
def activar_usuario(
    admin: SoloAdmin,
    usuario_id: int = Path(gt=0)
):
    return service.activar_usuario(usuario_id)


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic
)
def desactivar_usuario(
    admin: SoloAdmin,
    usuario_id: int = Path(gt=0)
):
    return service.desactivar_usuario(
        usuario_id,
        admin.id
    )