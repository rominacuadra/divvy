import { useState } from 'react'
import { StoreProvider } from './store'
import Dashboard from './pages/Dashboard'
import Gastos from './pages/Gastos'
import Categorias from './pages/Categorias'
import MediosPago from './pages/MediosPago'
import NuevoGasto from './components/NuevoGasto'
import styles from './App.module.css'

const TABS = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'gastos',     label: 'Gastos' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'medios',     label: 'Medios de pago' },
]

function AppInner() {
  const [tab, setTab] = useState('dashboard')
  const [showNuevo, setShowNuevo] = useState(false)

  const pages = { dashboard: <Dashboard />, gastos: <Gastos />, categorias: <Categorias />, medios: <MediosPago /> }

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Gastos</h1>
          <p className={styles.subtitle}>Control financiero personal</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNuevo(true)}>+ Nuevo gasto</button>
      </div>

      <nav className={styles.nav}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.navBtn} ${tab === t.id ? styles.active : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>{pages[tab]}</main>

      {showNuevo && <NuevoGasto onClose={() => setShowNuevo(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
