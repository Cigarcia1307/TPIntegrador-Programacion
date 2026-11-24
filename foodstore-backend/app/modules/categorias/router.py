from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"]
)


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[
    CategoriaService,
    Depends(get_categoria_service)
]


@router.get(
    "",
    response_model=list[CategoriaRead]
)
def listar_categorias(service: ServiceDep):
    return service.listar_categorias()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead
)
def obtener_categoria(
    service: ServiceDep,
    categoria_id: int = Path(gt=0)
):
    try:
        return service.obtener_categoria(categoria_id)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))]
)
def crear_categoria(
    datos: CategoriaCreate,
    service: ServiceDep
):
    try:
        return service.crear_categoria(datos)

    except NombreDuplicado as error:
        raise HTTPException(
            status_code=409,
            detail=str(error)
        ) from error


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))]
)
def actualizar_categoria(
    datos: CategoriaUpdate,
    service: ServiceDep,
    categoria_id: int = Path(gt=0)
):
    try:
        return service.actualizar_categoria(
            categoria_id,
            datos
        )

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error

    except NombreDuplicado as error:
        raise HTTPException(
            status_code=409,
            detail=str(error)
        ) from error


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))]
)
def anular_categoria(
    service: ServiceDep,
    categoria_id: int = Path(gt=0)
):
    try:
        service.anular_categoria(categoria_id)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        ) from error