from sqlalchemy import Column, String, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id          = Column(String(50),  primary_key=True)
    nombre      = Column(String(100), nullable=False)
    icono       = Column(String(10),  default="💰")
    presupuesto = Column(Float,       default=0)
    creado_en   = Column(DateTime,    server_default=func.now())


class MedioPago(Base):
    __tablename__ = "medios_pago"

    id        = Column(String(50),  primary_key=True)
    nombre    = Column(String(100), nullable=False, unique=True)
    creado_en = Column(DateTime,    server_default=func.now())


class Gasto(Base):
    __tablename__ = "gastos"

    id           = Column(String(50),  primary_key=True)
    fecha        = Column(Date,        nullable=False)
    descripcion  = Column(String(255), nullable=False)
    categoria_id = Column(String(50),  ForeignKey("categorias.id"), nullable=False)
    medio_pago_id= Column(String(50),  ForeignKey("medios_pago.id"), nullable=False)
    moneda       = Column(String(5),   default="ARS")
    monto        = Column(Float,       nullable=False)
    tipo         = Column(String(20),  nullable=False)  # "individual" | "compartido"
    splitwise    = Column(Boolean,     nullable=True)
    creado_en    = Column(DateTime,    server_default=func.now())
