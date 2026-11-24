from pydantic import ConfigDict
from sqlmodel import SQLModel, Field

from app.modules.categorias.schemas import CategoriaRead


class ProductoBase(SQLModel):
    nombre: str
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(gt=0)


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(SQLModel):
    nombre: str | None = None
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, gt=0)


class ProductoRead(ProductoBase):
    id: int
    activo: bool
    categoria: CategoriaRead

    model_config = ConfigDict(from_attributes=True)


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]