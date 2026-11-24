from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:

    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def _buscar_producto(self, uow, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)

        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(
                "Producto no encontrado"
            )

        return producto

    def _verificar_categoria(self, uow, categoria_id: int):
        categoria = uow.categorias.get_by_id(categoria_id)

        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(
                "Categoría no encontrada"
            )

        return categoria

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None
    ) -> ProductosPaginados:

        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible
            )

            return ProductosPaginados(
                total=total,
                items=[
                    ProductoRead.model_validate(producto)
                    for producto in productos
                ]
            )

    def obtener_producto(
        self,
        producto_id: int
    ) -> ProductoRead:

        with self.uow as uow:
            producto = self._buscar_producto(
                uow, producto_id
            )

            return ProductoRead.model_validate(producto)

    def crear_producto(
        self,
        datos: ProductoCreate
    ) -> ProductoRead:

        with self.uow as uow:
            categoria = self._verificar_categoria(
                uow, datos.categoria_id
            )

            producto = Producto(**datos.model_dump())
            producto.categoria = categoria

            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_producto(
        self,
        producto_id: int,
        datos: ProductoUpdate
    ) -> ProductoRead:

        with self.uow as uow:
            producto = self._buscar_producto(
                uow, producto_id
            )

            cambios = datos.model_dump(exclude_unset=True)

            campos_no_nulos = (
                "nombre",
                "precio_base",
                "stock",
                "disponible",
                "categoria_id"
            )

            for campo in campos_no_nulos:
                if cambios.get(campo) is None:
                    cambios.pop(campo, None)

            if "categoria_id" in cambios:
                categoria = self._verificar_categoria(
                    uow, cambios["categoria_id"]
                )

                producto.categoria = categoria

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self,
        producto_id: int,
        datos: ProductoStockUpdate
    ) -> ProductoRead:

        with self.uow as uow:
            producto = self._buscar_producto(
                uow, producto_id
            )

            producto.stock = datos.stock
            producto.disponible = datos.disponible

            return ProductoRead.model_validate(producto)

    def anular_producto(self, producto_id: int) -> None:

        with self.uow as uow:
            producto = self._buscar_producto(
                uow, producto_id
            )

            producto.activo = False