from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.core.database import session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic


def registrar_usuario(datos: UserCreate) -> UserPublic:

    with session_factory() as session:

        email = str(datos.email).strip().lower()
        username = datos.username.strip()

        existente = session.exec(
            select(Usuario).where(
                (Usuario.email == email)
                | (Usuario.username == username)
            )
        ).first()

        if existente is not None:
            raise HTTPException(
                status_code=409,
                detail="El usuario o email ya está registrado"
            )

        usuario = Usuario(
            username=username,
            full_name=datos.full_name.strip(),
            email=email,
            hashed_password=hash_password(datos.password),
            role="user",
            disabled=False
        )

        try:
            session.add(usuario)
            session.commit()
            session.refresh(usuario)

        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="El usuario o email ya está registrado"
            )

        return UserPublic.model_validate(usuario)


def listar_usuarios() -> list[UserPublic]:

    with session_factory() as session:
        usuarios = session.exec(
            select(Usuario).order_by(Usuario.id)
        ).all()

        return [
            UserPublic.model_validate(usuario)
            for usuario in usuarios
        ]


def activar_usuario(usuario_id: int) -> UserPublic:

    with session_factory() as session:
        usuario = session.get(Usuario, usuario_id)

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        usuario.disabled = False

        session.add(usuario)
        session.commit()
        session.refresh(usuario)

        return UserPublic.model_validate(usuario)


def desactivar_usuario(
    usuario_id: int,
    admin_id: int
) -> UserPublic:

    if usuario_id == admin_id:
        raise HTTPException(
            status_code=400,
            detail="No puede desactivar su propio usuario"
        )

    with session_factory() as session:
        usuario = session.get(Usuario, usuario_id)

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        usuario.disabled = True

        session.add(usuario)
        session.commit()
        session.refresh(usuario)

        return UserPublic.model_validate(usuario)