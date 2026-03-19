# 💸 Divvy

Registrá tus gastos, dividí los costos, conservá las amistades 💸

![Dashboard](./screenshots/dashboard.png)

---

## ✨ Funcionalidades

- 📊 **Dashboard mensual** — presupuesto vs. gastado por categoría con estado visual (verde / naranja / rojo)
- 💰 **Registro de gastos** — fecha, descripción, categoría, medio de pago y moneda (ARS / USD / EUR)
- 🤝 **Gastos compartidos** — marcá cualquier gasto como compartido (divide 50/50 automáticamente)
- 🗂️ **Categorías** — creá categorías personalizadas con íconos emoji y presupuestos mensuales
- 💳 **Medios de pago** — administrá tus tarjetas, billeteras virtuales y efectivo
- 📥 **Exportar CSV** — descargá reportes mensuales de gastos
- 🌙 **Interfaz dark mode** — diseño limpio y moderno

---

## 🗺️ Roadmap

> La visión de Divvy va más allá de las finanzas personales — hacia una app donde amigos, compañeros de casa o parejas puedan gestionar sus gastos compartidos juntos.

- [ ] Soporte multi-usuario con autenticación
- [ ] Grupos de gastos compartidos (roommates, viajes, eventos)
- [ ] Cálculo automático de balances entre usuarios
- [ ] Registro de pagos y saldos
- [ ] Notificaciones de resumen mensual

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, Chart.js, CSS Modules |
| Backend | FastAPI (Python 3.12) |
| Base de datos | MySQL 8.0 |
| ORM | SQLAlchemy 2.0 |
| Migraciones | Alembic |
| Contenedores | Docker, Docker Compose |
| Deploy | Railway |

---

## 🏗️ Arquitectura
```
divvy/
├── backend/
│   ├── main.py               ← Entry point + startup
│   ├── database.py           ← Conexión MySQL (SQLAlchemy)
│   ├── models.py             ← Modelos de base de datos
│   ├── schemas.py            ← Schemas de validación (Pydantic)
│   ├── alembic/              ← Migraciones de base de datos
│   │   └── versions/
│   │       ├── 0001_initial.py
│   │       └── 0002_example.py
│   └── routes/
│       ├── gastos.py
│       ├── categorias.py
│       └── medios.py
└── frontend/
|   └── src/
|       ├── api/              ← API client (axios)
|       ├── components/       ← Reusable components
|       ├── pages/            ← Dashboard, Expenses, Categories, Payment Methods
|       ├── store.jsx         ← Global state (React Context)
|       └── utils.js          ← Helpers (formatting, CSV export)
├── docs/
│   └── screenshots/          ← App screenshots para README
|   ├── index.html
```

---

## 🚀 Correr en local

### Requisitos
- Docker Desktop
```bash
# 1. Clonar el repo
git clone https://github.com/rominacuadra/divvy.git
cd divvy

# 2. Crear archivos de entorno locales
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Levantar todos los servicios
docker-compose up --build
```

| URL | Servicio |
|---|---|
| http://localhost:5173 | Frontend (React) |
| http://localhost:8000/docs | Documentación API (Swagger) |
| http://localhost:8000/health | Health check |

> **Usuarios Windows:** Asegurate de tener Docker Desktop corriendo antes de ejecutar el comando.

### Acceder desde el celular (misma red WiFi)
```bash
# Mac/Linux
ipconfig getifaddr en0

# Windows — buscar IPv4 Address
ipconfig
```

Abrí en el celular: `http://TU_IP_LOCAL:5173`

---

## 🗄️ Migraciones de base de datos
```bash
# Aplicar todas las migraciones pendientes
alembic upgrade head

# Generar migración automática tras cambio en modelos
alembic revision --autogenerate -m "descripción del cambio"

# Ver revisión actual
alembic current

# Volver atrás una migración
alembic downgrade -1
```

---

## ☁️ Deploy

Deployada en **Railway** usando dos servicios que apuntan al mismo repo de GitHub con diferentes directorios raíz.

| Servicio | Root Directory | Variable de entorno |
|---|---|---|
| Backend | `backend/` | `DATABASE_URL` |
| Frontend | `frontend/` | `VITE_API_URL` |

---

## 📄 English version

[README in English →](./README.md)

---

## 📬 Contacto

- **LinkedIn:** [linkedin.com/in/romina-cuadra](https://www.linkedin.com/in/romina-cuadra/)
- **GitHub:** [github.com/rominacuadra](https://github.com/rominacuadra)
- **Email:** [romicuadra@gmail.com](mailto:romicuadra@gmail.com)
