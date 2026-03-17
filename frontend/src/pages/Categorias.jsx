import { useState } from 'react'
import { useStore } from '../store'
import { createCategoria, updateCategoria } from '../api'
import { genId, fmt, ICONS } from '../utils'
import Modal from '../components/Modal'

export default function Categorias() {
  const { categorias, gastos, fetchCategorias } = useStore()
  const [showNew, setShowNew] = useState(false)
  const [showEdit, setShowEdit] = useState(null) // catId
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('💰')
  const [presup, setPresup] = useState('')
  const [errors, setErrors] = useState({})
  const [editPresup, setEditPresup] = useState('')
  const [editError, setEditError] = useState('')

  const gastadoTotal = (catId) => gastos.filter(g => g.categoria_id === catId).reduce((s, g) => s + g.monto, 0)

  const openNew = () => { setNombre(''); setIcono('💰'); setPresup(''); setErrors({}); setShowNew(true) }

  const handleCreate = async () => {
    const e = {}
    if (!nombre.trim()) e.nombre = 'Ingresá un nombre.'
    if (!presup || parseFloat(presup) <= 0) e.presup = 'El presupuesto debe ser mayor a $0.'
    setErrors(e)
    if (Object.keys(e).length) return
    await createCategoria({ id: genId(), nombre: nombre.trim(), icono, presupuesto: parseFloat(presup) })
    await fetchCategorias()
    setShowNew(false)
  }

  const openEdit = (cat) => { setShowEdit(cat.id); setEditPresup(String(cat.presupuesto || '')); setEditError('') }

  const handleEditPresup = async () => {
    if (!editPresup || parseFloat(editPresup) <= 0) { setEditError('Debe ser mayor a $0.'); return }
    await updateCategoria(showEdit, { presupuesto: parseFloat(editPresup) })
    await fetchCategorias()
    setShowEdit(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="section-title" style={{ margin: 0 }}>Categorías</p>
        <button className="btn btn-sm btn-primary" onClick={openNew}>+ Nueva categoría</button>
      </div>

      {categorias.length === 0 ? (
        <div className="empty-state">Sin categorías.</div>
      ) : (
        <div className="card">
          {categorias.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 24 }}>{cat.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  Presupuesto: {cat.presupuesto > 0 ? fmt(cat.presupuesto) : 'Sin asignar'} · Total histórico: {fmt(gastadoTotal(cat.id))}
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => openEdit(cat)}>Editar presupuesto</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva categoría */}
      {showNew && (
        <Modal title="Nueva categoría" onClose={() => setShowNew(false)}>
          <label>Nombre</label>
          <input value={nombre} onChange={e => { setNombre(e.target.value); setErrors(p => ({...p, nombre: undefined})) }} placeholder="Ej: Transporte" />
          {errors.nombre && <span className="field-error">{errors.nombre}</span>}

          <label>Ícono</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginTop: 8 }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcono(ic)} style={{
                width: 36, height: 36, border: `1px solid ${icono === ic ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8, fontSize: 18, background: icono === ic ? 'var(--accent2)' : 'var(--bg3)', cursor: 'pointer'
              }}>{ic}</button>
            ))}
          </div>

          <label>Presupuesto mensual (ARS)</label>
          <input type="number" value={presup} onChange={e => { setPresup(e.target.value); setErrors(p => ({...p, presup: undefined})) }} placeholder="0" min="0" />
          {errors.presup && <span className="field-error">{errors.presup}</span>}

          <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowNew(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}>Crear</button>
          </div>
        </Modal>
      )}

      {/* Modal editar presupuesto */}
      {showEdit && (
        <Modal title={`Presupuesto: ${categorias.find(c => c.id === showEdit)?.icono} ${categorias.find(c => c.id === showEdit)?.nombre}`} onClose={() => setShowEdit(null)}>
          <label>Presupuesto mensual (ARS)</label>
          <input type="number" value={editPresup} onChange={e => { setEditPresup(e.target.value); setEditError('') }} placeholder="0" min="0" />
          {editError && <span className="field-error">{editError}</span>}
          <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowEdit(null)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleEditPresup}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
