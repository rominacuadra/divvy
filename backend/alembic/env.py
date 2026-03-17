import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Agregar el directorio backend al path para poder importar los modelos
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base
import models  # noqa: F401 — importar los modelos para que Alembic los detecte

# Configuración de Alembic
config = context.config

# Sobreescribir la URL con la variable de entorno si existe
database_url = os.getenv("DATABASE_URL")
if database_url:
    # Railway puede dar mysql:// sin el driver
    if database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
    config.set_main_option("sqlalchemy.url", database_url)

# Configurar logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata de los modelos para autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Correr migraciones en modo 'offline' (sin conexión activa).
    Útil para generar SQL sin conectarse a la base.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Correr migraciones en modo 'online' (con conexión activa)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,       # detecta cambios de tipo de dato
            compare_server_default=True,  # detecta cambios en valores default
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
