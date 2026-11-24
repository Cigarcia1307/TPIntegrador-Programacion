from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    status,
)

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados,
)
from app.modules.productos.service import (
    ProductoService,
    ProductoNoEncontrado,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[
    ProductoService,
    Depends(get_producto_service)
]


@router.get(
    "",
    response_model=ProductosPaginados
)
def listar_productos(
    service: ServiceDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = None
):
    return service.listar_productos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRead
)
def obtener_producto(
    service: ServiceDep,
    producto_id: int = Path(gt=0)
):
    try:
        return service.obtener_producto(producto_id)

    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))]
)
def crear_producto(
    datos: ProductoCreate,
    service: ServiceDep
):
    try:
        return service.crear_producto(datos)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))]
)
def actualizar_producto(
    datos: ProductoUpdate,
    service: ServiceDep,
    producto_id: int = Path(gt=0)
):
    try:
        return service.actualizar_producto(
            producto_id,
            datos
        )

    except (
        ProductoNoEncontrado,
        CategoriaNoEncontrada
    ) as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))]
)
def actualizar_stock(
    datos: ProductoStockUpdate,
    service: ServiceDep,
    producto_id: int = Path(gt=0)
):
    try:
        return service.actualizar_stock(
            producto_id,
            datos
        )

    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))]
)
def anular_producto(
    service: ServiceDep,
    producto_id: int = Path(gt=0)
):
    try:
        service.anular_producto(producto_id)

    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error