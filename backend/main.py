import time
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Categoria, MedioPago
from routes.categorias import router as categorias_router
from routes.medios import router as medios_router
from routes.gastos import router as gastos_router
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mis Gastos API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categorias_router)
app.include_router(medios_router)
app.include_router(gastos_router)


def wait_for_db(retries: int = 10, delay: int = 3):
    """Espera a que MySQL esté listo para aceptar conexiones."""
    from sqlalchemy import text
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Intentando conectar a la base de datos (intento {attempt}/{retries})...")
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Conexión a la base de datos exitosa.")
            return
        except Exception as e:
            logger.warning(f"Base de datos no disponible aún: {e}")
            if attempt < retries:
                time.sleep(delay)
            else:
                raise RuntimeError("No se pudo conectar a la base de datos después de varios intentos.")


def run_migrations():
    """Aplica todas las migraciones pendientes."""
    logger.info("Ejecutando migraciones de Alembic...")
    from alembic.config import Config
    from alembic import command
    import os

    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))
    command.upgrade(alembic_cfg, "head")
    logger.info("Migraciones aplicadas correctamente.")


def seed_db():
    """Carga datos iniciales si la base está vacía."""
    logger.info("Verificando datos iniciales...")
    db = SessionLocal()
    try:
        if db.query(Categoria).count() == 0:
            logger.info("Cargando categorías por defecto...")
            cats = [
                Categoria(id="c1", nombre="Alimentación",    icono="🛒", presupuesto=50000),
                Categoria(id="c2", nombre="Transporte",      icono="🚗", presupuesto=20000),
                Categoria(id="c3", nombre="Salud",           icono="💊", presupuesto=15000),
                Categoria(id="c4", nombre="Entretenimiento", icono="🎬", presupuesto=10000),
                Categoria(id="c5", nombre="Hogar",           icono="🏠", presupuesto=30000),
            ]
            db.add_all(cats)

        if db.query(MedioPago).count() == 0:
            logger.info("Cargando medios de pago por defecto...")
            medios_default = [
                "TC Visa Santander", "TC Visa Provincia", "TC Master Provincia",
                "TC Amex Santander", "Mercado Pago", "Efectivo", "Ualá", "Tarjeta de débito"
            ]
            for nombre in medios_default:
                db.add(MedioPago(id=str(uuid.uuid4()), nombre=nombre))

        db.commit()
        logger.info("Datos iniciales listos.")
    finally:
        db.close()


@app.on_event("startup")
def startup():
    wait_for_db()
    run_migrations()
    seed_db()


@app.get("/health")
def health():
    return {"status": "ok"}