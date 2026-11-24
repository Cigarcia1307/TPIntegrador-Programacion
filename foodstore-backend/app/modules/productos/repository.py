from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):

    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None
    ) -> tuple[int, list[Producto]]:

        consulta = select(Producto).where(
            Producto.activo == True
        )

        if search:
            consulta = consulta.where(
                Producto.nombre.ilike(f"%{search}%")
            )

        if categoria_id is not None:
            consulta = consulta.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            consulta = consulta.where(
                Producto.disponible == disponible
            )

        consulta_total = select(func.count()).select_from(
            consulta.subquery()
        )

        total = self.session.exec(consulta_total).one()

        consulta = consulta.order_by(
            Producto.id
        ).offset(skip).limit(limit)

        productos = list(
            self.session.exec(consulta).all()
        )

        return total, productos