from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from models import Gasto
from schemas import GastoCreate, GastoUpdate, GastoOut

router = APIRouter(prefix="/gastos", tags=["gastos"])


@router.get("/", response_model=List[GastoOut])
def listar_gastos(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    categoria_id: Optional[str] = Query(None),
    medio_pago_id: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Gasto)
    if year:
        q = q.filter(Gasto.fecha >= date(year, month or 1, 1))
        if month:
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            q = q.filter(Gasto.fecha <= date(year, month, last_day))
        else:
            q = q.filter(Gasto.fecha <= date(year, 12, 31))
    if categoria_id:
        q = q.filter(Gasto.categoria_id == categoria_id)
    if medio_pago_id:
        q = q.filter(Gasto.medio_pago_id == medio_pago_id)
    if tipo:
        q = q.filter(Gasto.tipo == tipo)
    return q.order_by(Gasto.fecha.desc()).all()


@router.get("/meses", response_model=List[dict])
def meses_con_datos(db: Session = Depends(get_db)):
    from sqlalchemy import func, extract
    rows = (
        db.query(
            extract("year", Gasto.fecha).label("year"),
            extract("month", Gasto.fecha).label("month"),
        )
        .distinct()
        .order_by("year", "month")
        .all()
    )
    return [{"year": int(r.year), "month": int(r.month)} for r in rows]


@router.post("/", response_model=GastoOut, status_code=201)
def crear_gasto(data: GastoCreate, db: Session = Depends(get_db)):
    if db.query(Gasto).filter(Gasto.id == data.id).first():
        raise HTTPException(status_code=409, detail="Gasto ya existe")
    gasto = Gasto(**data.model_dump())
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.patch("/{gasto_id}", response_model=GastoOut)
def actualizar_gasto(gasto_id: str, data: GastoUpdate, db: Session = Depends(get_db)):
    gasto = db.query(Gasto).filter(Gasto.id == gasto_id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(gasto, field, value)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.delete("/{gasto_id}", status_code=204)
def eliminar_gasto(gasto_id: str, db: Session = Depends(get_db)):
    gasto = db.query(Gasto).filter(Gasto.id == gasto_id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    db.delete(gasto)
    db.commit()
