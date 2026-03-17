from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import MedioPago
from schemas import MedioPagoCreate, MedioPagoOut

router = APIRouter(prefix="/medios", tags=["medios"])


@router.get("/", response_model=List[MedioPagoOut])
def listar_medios(db: Session = Depends(get_db)):
    return db.query(MedioPago).order_by(MedioPago.creado_en).all()


@router.post("/", response_model=MedioPagoOut, status_code=201)
def crear_medio(data: MedioPagoCreate, db: Session = Depends(get_db)):
    if db.query(MedioPago).filter(MedioPago.nombre == data.nombre).first():
        raise HTTPException(status_code=409, detail="Ese medio de pago ya existe")
    medio = MedioPago(**data.model_dump())
    db.add(medio)
    db.commit()
    db.refresh(medio)
    return medio


@router.delete("/{medio_id}", status_code=204)
def eliminar_medio(medio_id: str, db: Session = Depends(get_db)):
    medio = db.query(MedioPago).filter(MedioPago.id == medio_id).first()
    if not medio:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    db.delete(medio)
    db.commit()
