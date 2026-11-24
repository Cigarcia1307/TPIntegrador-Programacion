from datetime import UTC, datetime

from app.modules.pedidos.models import (
    Pedido,
    DetallePedido,
    EstadoPedido,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS = {
    EstadoPedido.PENDIENTE: {
        EstadoPedido.EN_PREPARACION,
        EstadoPedido.CANCELADO,
    },
    EstadoPedido.EN_PREPARACION: {
        EstadoPedido.ENTREGADO,
        EstadoPedido.CANCELADO,
    },
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoService:

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _buscar_pedido(self, uow, pedido_id: int) -> Pedido:

        pedido = uow.pedidos.get_by_id(pedido_id)

        if pedido is None:
            raise PedidoNoEncontrado(
                "Pedido no encontrado"
            )

        return pedido

    def crear_pedido(
        self,
        usuario_id: int,
        datos: PedidoCreate
    ) -> PedidoRead:

        with self.uow as uow:

            ids = [
                item.producto_id
                for item in datos.items
            ]

            if len(ids) != len(set(ids)):
                raise ProductoRepetido(
                    "No se permiten productos repetidos"
                )

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=0.0
            )

            uow.pedidos.add(pedido)

            total = 0.0

            for item in datos.items:

                producto = uow.productos.get_by_id(
                    item.producto_id
                )

                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"Producto {producto.nombre} no disponible"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para {producto.nombre}"
                    )

                producto.stock -= item.cantidad

                precio = producto.precio_base
                subtotal = round(precio * item.cantidad, 2)

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    nombre_producto=producto.nombre,
                    cantidad=item.cantidad,
                    precio_unitario=precio,
                    subtotal=subtotal
                )

                pedido.items.append(detalle)

                uow.pedidos.crear_detalle(detalle)

                total += subtotal

            pedido.total = round(total, 2)

            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self,
        usuario_id: int,
        es_admin: bool,
        skip: int = 0,
        limit: int = 20,
        estado: EstadoPedido | None = None
    ) -> PedidosPaginados:

        with self.uow as uow:

            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=None if es_admin else usuario_id,
                skip=skip,
                limit=limit,
                estado=estado
            )

            return PedidosPaginados(
                total=total,
                items=[
                    PedidoRead.model_validate(pedido)
                    for pedido in pedidos
                ]
            )

    def obtener_pedido(
        self,
        pedido_id: int,
        usuario_id: int,
        es_admin: bool
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = self._buscar_pedido(
                uow, pedido_id
            )

            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno(
                    "No tenés permiso para ver este pedido"
                )

            return PedidoRead.model_validate(pedido)

    def _reponer_stock(
        self,
        uow,
        pedido: Pedido
    ) -> None:

        for detalle in pedido.items:

            producto = uow.productos.get_by_id(
                detalle.producto_id
            )

            if producto is None:
                raise ProductoNoEncontrado(
                    f"Producto {detalle.producto_id} no encontrado"
                )

            producto.stock += detalle.cantidad

    def cambiar_estado(
        self,
        pedido_id: int,
        nuevo_estado: EstadoPedido
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = self._buscar_pedido(
                uow, pedido_id
            )

            if nuevo_estado not in TRANSICIONES_VALIDAS[pedido.estado]:
                raise TransicionInvalida(
                    "Transición de estado inválida"
                )

            if nuevo_estado == EstadoPedido.CANCELADO:
                self._reponer_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(UTC)

            return PedidoRead.model_validate(pedido)

    def cancelar_pedido(
        self,
        pedido_id: int,
        usuario_id: int
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = self._buscar_pedido(
                uow, pedido_id
            )

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno(
                    "No podés cancelar un pedido ajeno"
                )

            if pedido.estado != EstadoPedido.PENDIENTE:
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos pendientes"
                )

            self._reponer_stock(uow, pedido)

            pedido.estado = EstadoPedido.CANCELADO
            pedido.updated_at = datetime.now(UTC)

            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:

        with self.uow as uow:

            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(
                    EstadoPedido.PENDIENTE
                ),
                en_preparacion=uow.pedidos.count_by_estado(
                    EstadoPedido.EN_PREPARACION
                ),
                entregados=uow.pedidos.count_by_estado(
                    EstadoPedido.ENTREGADO
                ),
                cancelados=uow.pedidos.count_by_estado(
                    EstadoPedido.CANCELADO
                ),
                pedidos_hoy=uow.pedidos.contar_pedidos_hoy(),
                ingresos_entregados=uow.pedidos.total_facturado()
            )