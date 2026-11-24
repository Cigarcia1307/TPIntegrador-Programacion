from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import (
    Pedido,
    DetallePedido,
    EstadoPedido,
)


class PedidoRepository(BaseRepository[Pedido]):

    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def crear_detalle(
        self,
        detalle: DetallePedido
    ) -> DetallePedido:

        self.session.add(detalle)
        self.session.flush()

        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
        estado: EstadoPedido | None = None
    ) -> tuple[int, list[Pedido]]:

        consulta = select(Pedido)

        if usuario_id is not None:
            consulta = consulta.where(
                Pedido.usuario_id == usuario_id
            )

        if estado is not None:
            consulta = consulta.where(
                Pedido.estado == estado
            )

        consulta_total = select(
            func.count()
        ).select_from(consulta.subquery())

        total = self.session.exec(consulta_total).one()

        consulta = (
            consulta
            .order_by(Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )

        pedidos = list(
            self.session.exec(consulta).all()
        )

        return total, pedidos

    def count_by_estado(
        self,
        estado: EstadoPedido
    ) -> int:

        consulta = select(
            func.count()
        ).select_from(Pedido).where(
            Pedido.estado == estado
        )

        return self.session.exec(consulta).one()

    def contar_pedidos_hoy(self) -> int:

        consulta = select(
            func.count()
        ).select_from(Pedido).where(
            func.date(Pedido.created_at) == func.current_date()
        )

        return self.session.exec(consulta).one()

    def total_facturado(self) -> float:

        consulta = select(
            func.coalesce(func.sum(Pedido.total), 0)
        ).where(
            Pedido.estado == EstadoPedido.ENTREGADO
        )

        return float(
            self.session.exec(consulta).one()
        )