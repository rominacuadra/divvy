import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { useStore } from '../store'
import { fmt, getMonthName } from '../utils'
import styles from './Dashboard.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

function StatusBadge({ gastado, presup }) {
  if (!presup) return <span className="badge badge-gray">Sin presupuesto</span>
  if (gastado > presup) return <span className="badge badge-red">Excedido</span>
  if (gastado > presup * 0.9) return <span className="badge badge-amber">Cerca del límite</span>
  return <span className="badge badge-green">En presupuesto</span>
}

export default function Dashboard() {
  const { categorias, gastos, currentMonth, currentYear, changeMonth } = useStore()

  const catData = useMemo(() => categorias.map(cat => ({
    cat,
    gastado: gastos.filter(g => g.categoria_id === cat.id).reduce((s, g) => s + g.monto, 0),
    presup: cat.presupuesto || 0
  })), [categorias, gastos])

  const total   = gastos.reduce((s, g) => s + g.monto, 0)
  const indiv   = gastos.filter(g => g.tipo === 'individual').reduce((s, g) => s + g.monto, 0)
  const compart = gastos.filter(g => g.tipo === 'compartido').reduce((s, g) => s + g.monto, 0)

  const sorted = [...catData].sort((a, b) => b.gastado - a.gastado)

  const barData = {
    labels: sorted.map(({ cat }) => `${cat.icono} ${cat.nombre}`),
    datasets: [
      {
        label: 'Presupuesto',
        data: sorted.map(({ presup }) => presup),
        backgroundColor: '#2e3448',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'Gastado',
        data: sorted.map(({ gastado }) => gastado),
        backgroundColor: sorted.map(({ gastado, presup }) =>
          presup > 0 && gastado > presup ? '#f87171' :
          presup > 0 && gastado > presup * 0.9 ? '#fbbf24' : '#4ade80'
        ),
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
        backgroundColor: '#1e2333',
        titleColor: '#e8eaf0',
        bodyColor: '#8b90a8',
        borderColor: '#2e3448',
        borderWidth: 1
      }
    },
    scales: {
      x: { ticks: { font: { size: 11 }, autoSkip: false, maxRotation: 30, color: '#8b90a8' }, grid: { display: false }, border: { color: '#2e3448' } },
      y: { ticks: { callback: v => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`, font: { size: 11 }, color: '#8b90a8' }, grid: { color: '#252b3b' }, border: { color: '#2e3448' } }
    }
  }

  const barColor = (gastado, presup) => {
    if (!presup) return '#4ade80'
    if (gastado > presup) return '#f87171'
    if (gastado > presup * 0.9) return '#fbbf24'
    return '#4ade80'
  }

  return (
    <div>
      {/* Month selector */}
      <div className={styles.monthSel}>
        <button className="btn btn-sm" onClick={() => changeMonth(-1)}>←</button>
        <span>{getMonthName(currentMonth, currentYear)}</span>
        <button className="btn btn-sm" onClick={() => changeMonth(1)}>→</button>
      </div>

      {/* Summary metrics */}
      <div className={styles.metrics}>
        <div className={styles.metric}><div className={styles.mLabel}>Total gastado</div><div className={styles.mValue}>{fmt(total)}</div></div>
        <div className={styles.metric}><div className={styles.mLabel}>Individual</div><div className={styles.mValue}>{fmt(indiv)}</div></div>
        <div className={styles.metric}><div className={styles.mLabel}>Compartido</div><div className={styles.mValue}>{fmt(compart)}</div></div>
      </div>

      {/* Category cards */}
      <p className="section-title">Detalle por categoría</p>
      <div className={styles.catGrid}>
        {catData.map(({ cat, gastado, presup }) => {
          const pct = presup > 0 ? Math.min((gastado / presup) * 100, 100) : 0
          const color = barColor(gastado, presup)
          return (
            <div key={cat.id} className="card">
              <div className={styles.catHead}>
                <span style={{ fontSize: 20 }}>{cat.icono}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.catName}>{cat.nombre}</div>
                  <StatusBadge gastado={gastado} presup={presup} />
                </div>
              </div>
              <div className={styles.catGastado}>Gastado: <strong style={{ color: 'var(--text)' }}>{fmt(gastado)}</strong></div>
              {presup > 0 ? (
                <>
                  <div className={styles.catPresup}>Presupuesto: {fmt(presup)}</div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} /></div>
                  <div style={{ fontSize: 12, marginTop: 4, color }}>
                    {gastado > presup ? `Excedido en ${fmt(gastado - presup)}` : `Disponible: ${fmt(presup - gastado)}`}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Sin presupuesto asignado</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bar chart */}
      <div className={styles.chartHeader}>
        <p className="section-title" style={{ margin: 0 }}>Presupuesto vs gastado</p>
        <div className={styles.legend}>
          <span><span className={styles.dot} style={{ background: '#2e3448' }} />Presupuesto</span>
          <span><span className={styles.dot} style={{ background: '#4ade80' }} />Gastado</span>
          <span><span className={styles.dot} style={{ background: '#fbbf24' }} />Cerca límite</span>
          <span><span className={styles.dot} style={{ background: '#f87171' }} />Excedido</span>
        </div>
      </div>
      <div className={styles.chartWrap}>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  )
}
