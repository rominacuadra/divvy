import { useState } from 'react'
import { useStore } from '../store'
import { createMedio, deleteMedio } from '../api'
import { genId } from '../utils'
import Modal from '../components/Modal'

export default function MediosPago() {
  const { medios, fetchMedios } = useStore()
  const [showNew, setShowNew] = useState(false)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const handleCreate = async () => {
    if (!nombre.trim()) { setError('Ingresá un nombre.'); return }
    try {
      await createMedio({ id: genId(), nombre: nombre.trim() })
      await fetchMedios()
      setShowNew(false)
      setNombre(''); setError('')
    } catch {
      setError('Ese medio ya existe.')
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await deleteMedio(id)
      await fetchMedios()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p className="section-title" style={{ margin: 0 }}>Medios de pago</p>
        <button className="btn btn-sm btn-primary" onClick={() => { setNombre(''); setError(''); setShowNew(true) }}>
          + Nuevo medio
        </button>
      </div>

      {medios.length === 0 ? (
        <div className="empty-state">Sin medios de pago.</div>
      ) : (
        <div className="card">
          {medios.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < medios.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <span style={{ fontSize: 20 }}>💳</span>
              <span style={{ flex: 1, fontSize: 14 }}>{m.nombre}</span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(m.id)}
                disabled={deleting === m.id}
              >
                {deleting === m.id ? '…' : 'Eliminar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <Modal title="Nuevo medio de pago" onClose={() => setShowNew(false)}>
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={e => { setNombre(e.target.value); setError('') }}
            placeholder="Ej: Banco Galicia"
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
          <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setShowNew(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}>Crear</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
