"""Ejemplo: agregar columna notas a gastos

Revision ID: 0002
Revises: 0001
Create Date: 2024-02-01 00:00:00.000000

Este archivo es un EJEMPLO de cómo se ve una migración para agregar
una columna nueva. No modifica ninguna tabla real todavía.

Para crear tus propias migraciones:

  # Opción A — autogenerar (Alembic compara modelos vs base de datos)
  alembic revision --autogenerate -m "descripción del cambio"

  # Opción B — crear vacía y escribirla a mano
  alembic revision -m "descripción del cambio"

  # Aplicar todas las migraciones pendientes
  alembic upgrade head

  # Ver en qué revisión está la base actualmente
  alembic current

  # Ver historial de migraciones
  alembic history --verbose

  # Volver una migración atrás
  alembic downgrade -1

  # Volver al estado inicial (sin tablas)
  alembic downgrade base
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0002'
down_revision: Union[str, None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ejemplo: agregar columna opcional "notas" a la tabla gastos
    op.add_column(
        'gastos',
        sa.Column('notas', sa.String(500), nullable=True,
                  comment='Notas adicionales sobre el gasto')
    )


def downgrade() -> None:
    op.drop_column('gastos', 'notas')
