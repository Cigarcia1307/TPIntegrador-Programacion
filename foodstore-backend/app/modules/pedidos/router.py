from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    status,
)

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import EstadoPedido
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    PedidoAjeno,
    StockInsuficiente,
    ProductoNoDisponible,
    ProductoRepetido,
    TransicionInvalida,
)
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    CambioEstado,
    PedidosPaginados,
    ResumenPedidos,
)


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[
    PedidoService,
    Depends(get_pedido_service)
]

UsuarioActual = Annotated[
    Usuario,
    Depends(get_current_active_user)
]

SoloAdmin = Annotated[
    Usuario,
    Depends(require_role(["admin"]))
]


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED
)
def crear_pedido(
    datos: PedidoCreate,
    servicio: ServiceDep,
    usuario: UsuarioActual
):
    try:
        return servicio.crear_pedido(
            usuario.id,
            datos
        )

    except ProductoNoEncontrado as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except (
        StockInsuficiente,
        ProductoNoDisponible,
        ProductoRepetido
    ) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get(
    "",
    response_model=PedidosPaginados
)
def listar_pedidos(
    servicio: ServiceDep,
    usuario: UsuarioActual,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = None
):
    return servicio.listar_pedidos(
        usuario_id=usuario.id,
        es_admin=usuario.role == "admin",
        skip=skip,
        limit=limit,
        estado=estado
    )


@router.get(
    "/resumen",
    response_model=ResumenPedidos
)
def obtener_resumen(
    servicio: ServiceDep,
    admin: SoloAdmin
):
    return servicio.obtener_resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead
)
def obtener_pedido(
    servicio: ServiceDep,
    usuario: UsuarioActual,
    pedido_id: int = Path(gt=0)
):
    try:
        return servicio.obtener_pedido(
            pedido_id=pedido_id,
            usuario_id=usuario.id,
            es_admin=usuario.role == "admin"
        )

    except PedidoNoEncontrado as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except PedidoAjeno as e:
        raise HTTPException(
            status_code=403,
            detail=str(e)
        )


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead
)
def cambiar_estado(
    datos: CambioEstado,
    servicio: ServiceDep,
    admin: SoloAdmin,
    pedido_id: int = Path(gt=0)
):
    try:
        return servicio.cambiar_estado(
            pedido_id,
            datos.estado
        )

    except (
        PedidoNoEncontrado,
        ProductoNoEncontrado
    ) as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except TransicionInvalida as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead
)
def cancelar_pedido(
    servicio: ServiceDep,
    usuario: UsuarioActual,
    pedido_id: int = Path(gt=0)
):
    try:
        return servicio.cancelar_pedido(
            pedido_id,
            usuario.id
        )

    except (
        PedidoNoEncontrado,
        ProductoNoEncontrado
    ) as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except PedidoAjeno as e:
        raise HTTPException(
            status_code=403,
            detail=str(e)
        )

    except TransicionInvalida as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )