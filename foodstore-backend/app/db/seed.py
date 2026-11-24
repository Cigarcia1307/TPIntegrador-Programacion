from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password

from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido


def seed():

    create_all_tables()

    with session_factory() as session:

        # Usuario administrador
        admin = session.exec(
            select(Usuario).where(
                Usuario.username == "admin"
            )
        ).first()

        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False
            )

            session.add(admin)

        # Categorías
        categorias = [
            ("Almacén", "Productos de almacén"),
            ("Bebidas", "Bebidas sin alcohol"),
            ("Lácteos", "Leche, quesos y yogures"),
        ]

        categorias_ids = {}

        for nombre, descripcion in categorias:

            categoria = session.exec(
                select(Categoria).where(
                    Categoria.nombre == nombre
                )
            ).first()

            if categoria is None:
                categoria = Categoria(
                    nombre=nombre,
                    descripcion=descripcion,
                    activo=True
                )

                session.add(categoria)
                session.flush()

            categorias_ids[nombre] = categoria.id

        # Productos
        productos = [
            ("Arroz", "Arroz largo fino 1 kg", 2500, 30, "Almacén"),
            ("Fideos", "Fideos secos 500 g", 1800, 25, "Almacén"),
            ("Harina", "Harina de trigo 1 kg", 1500, 20, "Almacén"),
            ("Aceite", "Aceite de girasol 900 ml", 3500, 15, "Almacén"),
            ("Agua mineral", "Agua mineral 1,5 litros", 1200, 40, "Bebidas"),
            ("Jugo de naranja", "Jugo de naranja 1 litro", 2200, 20, "Bebidas"),
            ("Leche", "Leche entera 1 litro", 1900, 25, "Lácteos"),
            ("Yogur", "Yogur de vainilla", 1600, 15, "Lácteos"),
        ]

        for nombre, descripcion, precio, stock, categoria in productos:

            existente = session.exec(
                select(Producto).where(
                    Producto.nombre == nombre
                )
            ).first()

            if existente is None:

                producto = Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                    categoria_id=categorias_ids[categoria],
                    disponible=True,
                    activo=True
                )

                session.add(producto)

        session.commit()

    print("Seed ejecutado correctamente.")


if __name__ == "__main__":
    seed()