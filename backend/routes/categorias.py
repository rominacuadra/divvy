from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Categoria
from schemas import CategoriaCreate, CategoriaUpdate, CategoriaOut

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("/", response_model=List[CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.creado_en).all()


@router.post("/", response_model=CategoriaOut, status_code=201)
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    if db.query(Categoria).filter(Categoria.id == data.id).first():
        raise HTTPException(status_code=409, detail="Categoría ya existe")
    cat = Categoria(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch("/{cat_id}", response_model=CategoriaOut)
def actualizar_categoria(cat_id: str, data: CategoriaUpdate, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat
