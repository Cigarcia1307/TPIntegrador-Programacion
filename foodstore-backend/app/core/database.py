from sqlmodel import SQLModel, Session, create_engine

from app.core.config import get_settings


settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    echo=False
)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables():
    SQLModel.metadata.create_all(engine)