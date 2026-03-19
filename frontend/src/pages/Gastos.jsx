import { useState } from 'react'
import { useStore } from '../store'
import { getMesesConDatos, deleteGasto } from '../api'
import { fmt, fmtMon, getMonthName, toCSV } from '../utils'
import NuevoGasto from '../components/NuevoGasto'
import styles from './Gastos.module.css'

export default function Gastos() {
  const { gastos, categorias, medios, currentMonth, currentYear, refreshGastos } = useStore()
  const [fCat, setFCat] = useState('')
  const [fMedio, setFMedio] = useState('')
  const [fTipo, setFTipo] = useState('')
  const [fDesde, setFDesde] = useState('')
  const [fHasta, setFHasta] = useState('')
  const [showCSV, setShowCSV] = useState(false)
  const [csvMeses, setCsvMeses] = useState([])
  const [csvMes, setCsvMes] = useState('')
  const [editando, setEditando] = useState(null)       // gasto que se está editando
  const [eliminando, setEliminando] = useState(null)   // gasto pendiente de confirmar eliminación

  const filtered = gastos.filter(g => {
    if (fCat && g.categoria_id !== fCat) return false
    if (fMedio && g.medio_pago_id !== fMedio) return false
    if (fTipo && g.tipo !== fTipo) return false
    if (fDesde && g.fecha < fDesde) return false
    if (fHasta && g.fecha > fHasta) return false
    return true
  })

  const openCSV = async () => {
    const meses = await getMesesConDatos()
    setCsvMeses(meses)
    const cur = meses.find(m => m.year === currentYear && m.month === currentMonth)
    setCsvMes(cur ? `${cur.year}-${cur.month}` : (meses[0] ? `${meses[0].year}-${meses[0].month}` : ''))
    setShowCSV(true)
  }

  const downloadCSV = async () => {
    if (!csvMes) return
    const [year, month] = csvMes.split('-').map(Number)
    const { getGastos } = await import('../api')
    const data = await getGastos({ year, month })
    const csv = toCSV(data, categorias, medios)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gastos_${getMonthName(month, year).replace(' ', '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowCSV(false)
  }

  const handleEliminar = async () => {
    if (!eliminando) return
    await deleteGasto(eliminando.id)
    refreshGastos()
    setEliminando(null)
  }

  return (
    <div>
      <div className={styles.filters}>
        <input type="date" value={fDesde} onChange={e => setFDesde(e.target.value)} style={{width:'auto'}} />
        <input type="date" value={fHasta} onChange={e => setFHasta(e.target.value)} style={{width:'auto'}} />
        <select value={fCat} onChange={e => setFCat(e.target.value)} style={{width:'auto'}}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
        </select>
        <select value={fMedio} onChange={e => setFMedio(e.target.value)} style={{width:'auto'}}>
          <option value="">Todos los medios</option>
          {medios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <select value={fTipo} onChange={e => setFTipo(e.target.value)} style={{width:'auto'}}>
          <option value="">Tipo de gasto</option>
          <option value="individual">Individual</option>
          <option value="compartido">Compartido</option>
        </select>
      </div>

      <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
        <button className="btn btn-sm" onClick={openCSV}>⬇ Descargar CSV</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Sin gastos en este período.</div>
      ) : (
        <div className="card">
          {filtered.map(g => {
            const cat = categorias.find(c => c.id === g.categoria_id)
            const medio = medios.find(m => m.id === g.medio_pago_id)
            return (
              <div key={g.id} className={styles.row}>
                <div className={styles.iconWrap}>
                  <div className={styles.icon}>{cat?.icono || '💰'}</div>
                  <span className={styles.tooltip}>{cat?.nombre || 'Sin categoría'}</span>
                </div>
                <div className={styles.info}>
                  <div className={styles.desc}>{g.descripcion}</div>
                  <div className={styles.meta}>
                    <span>{g.fecha}</span>
                    <span>·</span>
                    <span>{medio?.nombre || '—'}</span>
                    <span>·</span>
                    <span className={`badge ${g.tipo === 'compartido' ? 'badge-blue' : 'badge-gray'}`}>{g.tipo}</span>
                    {/* Splitwise badges — comentado, solo uso personal
                    {g.tipo === 'compartido' && (
                      g.splitwise
                        ? <span className="badge badge-teal">Anotado en SW</span>
                        : <span className="badge badge-coral">No anotado en SW</span>
                    )}
                    */}
                  </div>
                </div>
                <div className={styles.amount}>{fmtMon(g.monto, g.moneda)}</div>
                <div className={styles.actions}>
                  <button
                    className="btn btn-sm"
                    onClick={() => setEditando(g)}
                  >Editar</button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setEliminando(g)}
                  >Eliminar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal editar gasto */}
      {editando && (
        <NuevoGasto
          gasto={editando}
          onClose={() => setEditando(null)}
        />
      )}

      {/* Modal confirmar eliminación */}
      {eliminando && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
          <div className="card" style={{width:340}}>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:'0.75rem'}}>Eliminar gasto</h3>
            <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>
              Al eliminar <strong style={{color:'var(--text)'}}>{eliminando.descripcion}</strong>, no podrá recuperarse. ¿Continuás?
            </p>
            <div style={{display:'flex',gap:8,marginTop:'1.5rem'}}>
              <button className="btn" style={{flex:1}} onClick={() => setEliminando(null)}>Cancelar</button>
              <button className="btn btn-danger" style={{flex:1}} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CSV */}
      {showCSV && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
          <div className="card" style={{width:320}}>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:'1rem'}}>Descargar CSV</h3>
            <label>Mes a descargar</label>
            <select value={csvMes} onChange={e => setCsvMes(e.target.value)}>
              {csvMeses.map(m => (
                <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                  {getMonthName(m.month, m.year)}
                </option>
              ))}
            </select>
            <div style={{display:'flex',gap:8,marginTop:'1.5rem'}}>
              <button className="btn" style={{flex:1}} onClick={() => setShowCSV(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{flex:1}} onClick={downloadCSV}>Descargar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
