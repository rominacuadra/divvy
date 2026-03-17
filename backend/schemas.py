from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# ── Categoría ──────────────────────────────────────────────
class CategoriaCreate(BaseModel):
    id: str
    nombre: str
    icono: str = "💰"
    presupuesto: float = 0

class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    icono: Optional[str] = None
    presupuesto: Optional[float] = None

class CategoriaOut(BaseModel):
    id: str
    nombre: str
    icono: str
    presupuesto: float
    creado_en: datetime

    class Config:
        from_attributes = True


# ── Medio de pago ──────────────────────────────────────────
class MedioPagoCreate(BaseModel):
    id: str
    nombre: str

class MedioPagoOut(BaseModel):
    id: str
    nombre: str
    creado_en: datetime

    class Config:
        from_attributes = True


# ── Gasto ──────────────────────────────────────────────────
class GastoCreate(BaseModel):
    id: str
    fecha: date
    descripcion: str
    categoria_id: str
    medio_pago_id: str
    moneda: str = "ARS"
    monto: float
    tipo: str
    splitwise: Optional[bool] = None

class GastoUpdate(BaseModel):
    fecha: Optional[date] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[str] = None
    medio_pago_id: Optional[str] = None
    moneda: Optional[str] = None
    monto: Optional[float] = None
    tipo: Optional[str] = None
    splitwise: Optional[bool] = None

class GastoOut(BaseModel):
    id: str
    fecha: date
    descripcion: str
    categoria_id: str
    medio_pago_id: str
    moneda: str
    monto: float
    tipo: str
    splitwise: Optional[bool]
    creado_en: datetime

    class Config:
        from_attributes = True
