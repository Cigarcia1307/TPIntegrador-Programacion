from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:

    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar_categorias(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
                if categoria.activo
            ]

    def obtener_categoria(
        self,
        categoria_id: int
    ) -> CategoriaRead:

        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada(
                    "Categoría no encontrada"
                )

            return CategoriaRead.model_validate(categoria)

    def crear_categoria(
        self,
        datos: CategoriaCreate
    ) -> CategoriaRead:

        try:
            with self.uow as uow:
                existente = uow.categorias.get_by_nombre(
                    datos.nombre
                )

                if existente is not None:
                    raise NombreDuplicado(
                        "Ya existe una categoría con ese nombre"
                    )

                categoria = Categoria(**datos.model_dump())

                uow.categorias.add(categoria)

                return CategoriaRead.model_validate(categoria)

        except IntegrityError as error:
            raise NombreDuplicado(
                "Ya existe una categoría con ese nombre"
            ) from error

    def actualizar_categoria(
        self,
        categoria_id: int,
        datos: CategoriaUpdate
    ) -> CategoriaRead:

        try:
            with self.uow as uow:
                categoria = uow.categorias.get_by_id(categoria_id)

                if categoria is None or not categoria.activo:
                    raise CategoriaNoEncontrada(
                        "Categoría no encontrada"
                    )

                cambios = datos.model_dump(exclude_unset=True)

                if cambios.get("nombre") is None:
                    cambios.pop("nombre", None)

                if "nombre" in cambios:
                    existente = uow.categorias.get_by_nombre(
                        cambios["nombre"]
                    )

                    if (
                        existente is not None
                        and existente.id != categoria_id
                    ):
                        raise NombreDuplicado(
                            "Ya existe una categoría con ese nombre"
                        )

                for campo, valor in cambios.items():
                    setattr(categoria, campo, valor)

                return CategoriaRead.model_validate(categoria)

        except IntegrityError as error:
            raise NombreDuplicado(
                "Ya existe una categoría con ese nombre"
            ) from error

    def anular_categoria(self, categoria_id: int) -> None:

        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada(
                    "Categoría no encontrada"
                )

            categoria.activo = False