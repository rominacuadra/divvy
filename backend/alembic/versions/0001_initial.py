"""Migración inicial — crea todas las tablas

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

Tablas:
  - categorias    : categorías de gastos con presupuesto mensual
  - medios_pago   : medios de pago disponibles
  - gastos        : registro de gastos individuales o compartidos
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Tabla: categorias ─────────────────────────────────────────────────────
    op.create_table(
        'categorias',
        sa.Column('id',          sa.String(50),  primary_key=True, nullable=False,
                  comment='ID único de la categoría'),
        sa.Column('nombre',      sa.String(100), nullable=False,
                  comment='Nombre de la categoría'),
        sa.Column('icono',       sa.String(10),  nullable=False, server_default='💰',
                  comment='Emoji que representa la categoría'),
        sa.Column('presupuesto', sa.Float,       nullable=False, server_default='0',
                  comment='Presupuesto mensual en ARS'),
        sa.Column('creado_en',   sa.DateTime,    nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP'),
                  comment='Fecha de creación'),
    )

    # ── Tabla: medios_pago ────────────────────────────────────────────────────
    op.create_table(
        'medios_pago',
        sa.Column('id',        sa.String(50),  primary_key=True, nullable=False,
                  comment='ID único del medio de pago'),
        sa.Column('nombre',    sa.String(100), nullable=False,
                  comment='Nombre del medio de pago (debe ser único)'),
        sa.Column('creado_en', sa.DateTime,    nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP'),
                  comment='Fecha de creación'),

        sa.UniqueConstraint('nombre', name='uq_medios_pago_nombre'),
    )

    # ── Tabla: gastos ─────────────────────────────────────────────────────────
    op.create_table(
        'gastos',
        sa.Column('id',            sa.String(50),  primary_key=True, nullable=False,
                  comment='ID único del gasto'),
        sa.Column('fecha',         sa.Date,        nullable=False,
                  comment='Fecha en que ocurrió el gasto'),
        sa.Column('descripcion',   sa.String(255), nullable=False,
                  comment='Descripción del gasto'),
        sa.Column('categoria_id',  sa.String(50),  nullable=False,
                  comment='Categoría a la que pertenece el gasto'),
        sa.Column('medio_pago_id', sa.String(50),  nullable=False,
                  comment='Medio de pago utilizado'),
        sa.Column('moneda',        sa.String(5),   nullable=False, server_default='ARS',
                  comment='Código de moneda: ARS, USD, EUR'),
        sa.Column('monto',         sa.Float,       nullable=False,
                  comment='Monto del gasto (ya dividido si es compartido)'),
        sa.Column('tipo',          sa.Enum('individual', 'compartido', name='tipo_gasto'),
                  nullable=False,
                  comment='Tipo de gasto: individual o compartido'),
        # TODO: habilitar cuando se implemente multi-usuario y gastos compartidos entre personas
        sa.Column('splitwise',     sa.Boolean,     nullable=True,
                  comment='True si fue anotado en Splitwise. NULL si es individual.'),
        sa.Column('creado_en',     sa.DateTime,    nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP'),
                  comment='Fecha de registro en el sistema'),

        # Foreign keys
        sa.ForeignKeyConstraint(
            ['categoria_id'], ['categorias.id'],
            name='fk_gastos_categoria',
            ondelete='RESTRICT',   # no se puede borrar una categoría con gastos
        ),
        sa.ForeignKeyConstraint(
            ['medio_pago_id'], ['medios_pago.id'],
            name='fk_gastos_medio_pago',
            ondelete='RESTRICT',   # no se puede borrar un medio con gastos
        ),
    )

    # ── Índices para búsquedas frecuentes ─────────────────────────────────────
    op.create_index('ix_gastos_fecha',        'gastos', ['fecha'])
    op.create_index('ix_gastos_categoria_id', 'gastos', ['categoria_id'])
    op.create_index('ix_gastos_medio_pago_id','gastos', ['medio_pago_id'])
    op.create_index('ix_gastos_tipo',         'gastos', ['tipo'])
    # Índice compuesto para el filtro más común: gastos por mes
    op.create_index('ix_gastos_fecha_cat',    'gastos', ['fecha', 'categoria_id'])


def downgrade() -> None:
    # Borrar en orden inverso para respetar las foreign keys
    op.drop_index('ix_gastos_fecha_cat',     table_name='gastos')
    op.drop_index('ix_gastos_tipo',          table_name='gastos')
    op.drop_index('ix_gastos_medio_pago_id', table_name='gastos')
    op.drop_index('ix_gastos_categoria_id',  table_name='gastos')
    op.drop_index('ix_gastos_fecha',         table_name='gastos')
    op.drop_table('gastos')
    op.drop_table('medios_pago')
    op.drop_table('categorias')