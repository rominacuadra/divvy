import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useStore } from '../store'
import { createGasto, updateGasto, createCategoria, createMedio, updateCategoria } from '../api'
import { genId, fmt, fmtMon, ICONS } from '../utils'
import styles from './NuevoGasto.module.css'

const MONEDAS = ['ARS', 'USD', 'EUR']

function FieldError({ msg }) {
  return msg ? <span className="field-error">{msg}</span> : null
}

// gasto: si viene con datos, es modo edición. Si es null, es modo creación.
export default function NuevoGasto({ onClose, gasto = null }) {
  const { categorias, fetchCategorias, medios, fetchMedios, refreshGastos } = useStore()
  const esEdicion = !!gasto

  // En edición, el monto real que se muestra es el que está guardado.
  // Si era compartido, el monto guardado YA es la mitad — lo mostramos tal cual.
  const [fecha, setFecha] = useState(gasto?.fecha || new Date().toISOString().split('T')[0])
  const [desc, setDesc] = useState(gasto?.descripcion || '')
  const [catId, setCatId] = useState(gasto?.categoria_id || '')
  const [medioId, setMedioId] = useState(gasto?.medio_pago_id || '')
  const [moneda, setMoneda] = useState(gasto?.moneda || 'ARS')
  // En edición de gasto compartido: el monto guardado es la mitad,
  // mostramos el total (monto * 2) para que el usuario pueda editar el total original
  const montoInicial = gasto
    ? (gasto.tipo === 'compartido' ? String(gasto.monto * 2) : String(gasto.monto))
    : ''
  const [montoRaw, setMontoRaw] = useState(montoInicial)
  const [tipo, setTipo] = useState(gasto?.tipo || 'individual')
  const [sw, setSw] = useState(gasto?.splitwise || false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Sub-modal states
  const [showNoCat, setShowNoCat] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [showNewMedio, setShowNewMedio] = useState(false)
  const [showEditPresup, setShowEditPresup] = useState(false)
  const [pendingGasto, setPendingGasto] = useState(null)

  // Nueva categoría form
  const [ncNombre, setNcNombre] = useState('')
  const [ncIcono, setNcIcono] = useState('💰')
  const [ncPresup, setNcPresup] = useState('')
  const [ncErrors, setNcErrors] = useState({})

  // Nuevo medio form
  const [nmNombre, setNmNombre] = useState('')
  const [nmError, setNmError] = useState('')

  // Edit presupuesto form
  const [epMonto, setEpMonto] = useState('')
  const [epError, setEpError] = useState('')

  const validate = () => {
    const e = {}
    if (!fecha) e.fecha = 'Ingresá la fecha.'
    if (!catId) e.cat = 'Seleccioná una categoría.'
    if (!desc.trim()) e.desc = 'Ingresá una descripción.'
    if (!medioId) e.medio = 'Seleccioná un medio de pago.'
    if (!montoRaw || parseFloat(montoRaw) <= 0) e.monto = 'Ingresá un monto mayor a $0.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGuardar = async () => {
    if (!validate()) return
    const monto = parseFloat(montoRaw)
    const data = {
      fecha,
      descripcion: desc.trim(),
      categoria_id: catId,
      medio_pago_id: medioId,
      moneda,
      monto,
      tipo,
      splitwise: tipo === 'compartido' ? sw : null
    }

    if (esEdicion) {
      // En edición también dividimos por 2 si es compartido
      await guardarGastoFinal({ ...data, monto: tipo === 'compartido' ? monto / 2 : monto })
      return
    }

    // Solo en creación chequeamos si es primer gasto sin presupuesto
    const cat = categorias.find(c => c.id === catId)
    const sinPresupuesto = !cat.presupuesto || cat.presupuesto <= 0
    if (sinPresupuesto) {
      setPendingGasto({ ...data, monto: tipo === 'compartido' ? monto / 2 : monto })
      setShowNoCat(true)
      return
    }
    await guardarGastoFinal({ ...data, monto: tipo === 'compartido' ? monto / 2 : monto })
  }

  const guardarGastoFinal = async (data) => {
    setSaving(true)
    try {
      if (esEdicion) {
        await updateGasto(gasto.id, data)
      } else {
        await createGasto({ id: genId(), ...data })
      }
      refreshGastos()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleCrearCategoria = async () => {
    const e = {}
    if (!ncNombre.trim()) e.nombre = 'Ingresá un nombre.'
    if (!ncPresup || parseFloat(ncPresup) <= 0) e.presup = 'El presupuesto debe ser mayor a $0.'
    setNcErrors(e)
    if (Object.keys(e).length) return
    const newCat = { id: genId(), nombre: ncNombre.trim(), icono: ncIcono, presupuesto: parseFloat(ncPresup) }
    await createCategoria(newCat)
    await fetchCategorias()
    setCatId(newCat.id)
    setErrors(prev => ({ ...prev, cat: undefined }))
    setShowNewCat(false)
    setNcNombre(''); setNcIcono('💰'); setNcPresup(''); setNcErrors({})
  }

  const handleCrearMedio = async () => {
    if (!nmNombre.trim()) { setNmError('Ingresá un nombre.'); return }
    const newMedio = { id: genId(), nombre: nmNombre.trim() }
    try {
      await createMedio(newMedio)
      await fetchMedios()
      setMedioId(newMedio.id)
      setErrors(prev => ({ ...prev, medio: undefined }))
      setShowNewMedio(false)
      setNmNombre(''); setNmError('')
    } catch (e) {
      setNmError('Ese medio ya existe.')
    }
  }

  const handleGuardarPresup = async () => {
    if (!epMonto || parseFloat(epMonto) <= 0) { setEpError('Debe ser mayor a $0.'); return }
    await updateCategoria(pendingGasto.categoria_id, { presupuesto: parseFloat(epMonto) })
    await fetchCategorias()
    setShowEditPresup(false)
    setEpMonto(''); setEpError('')
    setShowNoCat(true)
  }

  // Muestra la mitad cuando el tipo es compartido, tanto en creación como en edición
  const montoCalculado = tipo === 'compartido' && parseFloat(montoRaw) > 0
    ? parseFloat(montoRaw) / 2
    : null

  const catActual = categorias.find(c => c.id === catId)

  return (
    <>
      <Modal title={esEdicion ? 'Editar gasto' : 'Nuevo gasto'} onClose={onClose}>
        <div className="row2">
          <div>
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e => { setFecha(e.target.value); setErrors(p => ({...p, fecha: undefined})) }} />
            <FieldError msg={errors.fecha} />
          </div>
          <div>
            <label>Categoría *</label>
            <select value={catId} onChange={e => {
              if (e.target.value === '__nueva__') { setShowNewCat(true); return }
              setCatId(e.target.value)
              setErrors(p => ({...p, cat: undefined}))
            }}>
              <option value="">— Seleccioná —</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              <option value="__nueva__">+ Nueva categoría</option>
            </select>
            <FieldError msg={errors.cat} />
          </div>
        </div>

        <label>Descripción</label>
        <input value={desc} onChange={e => { setDesc(e.target.value); setErrors(p => ({...p, desc: undefined})) }} placeholder="Ej: Supermercado Coto" />
        <FieldError msg={errors.desc} />

        <label>Medio de pago</label>
        <select value={medioId} onChange={e => {
          if (e.target.value === '__nuevo__') { setShowNewMedio(true); return }
          setMedioId(e.target.value)
          setErrors(p => ({...p, medio: undefined}))
        }}>
          <option value="">— Seleccioná —</option>
          {medios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          <option value="__nuevo__">+ Nuevo medio de pago</option>
        </select>
        <FieldError msg={errors.medio} />

        <label style={{marginTop: 12}}>¿Tipo de gasto?</label>
        <div className={styles.toggle}>
          <button className={`${styles.opt} ${tipo === 'individual' ? styles.selected : ''}`} onClick={() => setTipo('individual')}>Individual</button>
          <button className={`${styles.opt} ${tipo === 'compartido' ? styles.selected : ''}`} onClick={() => setTipo('compartido')}>Compartido</button>
        </div>

        {tipo === 'compartido' && (
          <div className={styles.swRow}>
            <input type="checkbox" id="sw" checked={sw} onChange={e => setSw(e.target.checked)} style={{width:'auto', accentColor:'var(--accent)'}} />
            <label htmlFor="sw" style={{marginTop:0, color:'var(--text)'}}>Ya anotado en Splitwise</label>
          </div>
        )}

        <div className="row2" style={{marginTop: 12}}>
          <div>
            <label>Moneda</label>
            <select value={moneda} onChange={e => setMoneda(e.target.value)}>
              {MONEDAS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label>Monto total</label>
            <input type="number" value={montoRaw} onChange={e => { setMontoRaw(e.target.value); setErrors(p => ({...p, monto: undefined})) }} placeholder="0" min="0" />
            <FieldError msg={errors.monto} />
          </div>
        </div>

        {montoCalculado && (
          <div className={styles.montoReal}>
            Monto a registrar: <strong>{fmtMon(montoCalculado, moneda)} (mitad)</strong>
          </div>
        )}

        <div style={{display:'flex', gap:8, marginTop:'1.5rem'}}>
          <button className="btn" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={handleGuardar} disabled={saving}>
            {saving ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </Modal>

      {/* Sub-modal: sin presupuesto (solo en creación) */}
      {showNoCat && pendingGasto && (
        <Modal title={`${catActual?.icono} Sin presupuesto`} onClose={() => {}}>
          <p style={{fontSize:13, color:'var(--text2)', lineHeight:1.6}}>
            La categoría <strong style={{color:'var(--text)'}}>{catActual?.nombre}</strong> no tiene presupuesto mensual asignado. Asigná uno antes de continuar.
          </p>
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:'1.5rem'}}>
            <button className="btn btn-primary" onClick={() => { setShowNoCat(false); setEpMonto(''); setShowEditPresup(true) }}>
              Asignar presupuesto
            </button>
            <button className="btn" style={{color:'var(--text2)'}} onClick={() => setShowNoCat(false)}>
              Volver al gasto
            </button>
          </div>
        </Modal>
      )}

      {/* Sub-modal: editar presupuesto */}
      {showEditPresup && pendingGasto && (
        <Modal title={`Presupuesto: ${catActual?.icono} ${catActual?.nombre}`} onClose={() => { setShowEditPresup(false); setShowNoCat(true) }}>
          <label>Presupuesto mensual (ARS)</label>
          <input type="number" value={epMonto} onChange={e => { setEpMonto(e.target.value); setEpError('') }} placeholder="0" min="0" />
          {epError && <span className="field-error">{epError}</span>}
          <div style={{display:'flex', gap:8, marginTop:'1.5rem'}}>
            <button className="btn" style={{flex:1}} onClick={() => { setShowEditPresup(false); setShowNoCat(true) }}>Cancelar</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={handleGuardarPresup}>Guardar</button>
          </div>
          {catActual?.presupuesto > 0 && (
            <button className="btn btn-primary" style={{width:'100%', marginTop:8}} onClick={() => { setShowEditPresup(false); guardarGastoFinal(pendingGasto) }}>
              Guardar gasto de todas formas
            </button>
          )}
        </Modal>
      )}

      {/* Sub-modal: nueva categoría */}
      {showNewCat && (
        <Modal title="Nueva categoría" onClose={() => { setShowNewCat(false) }}>
          <label>Nombre</label>
          <input value={ncNombre} onChange={e => { setNcNombre(e.target.value); setNcErrors(p=>({...p,nombre:undefined})) }} placeholder="Ej: Transporte" />
          {ncErrors.nombre && <span className="field-error">{ncErrors.nombre}</span>}
          <label>Ícono</label>
          <div className={styles.iconGrid}>
            {ICONS.map(ic => (
              <button key={ic} className={`${styles.iconOpt} ${ncIcono === ic ? styles.iconSel : ''}`} onClick={() => setNcIcono(ic)}>{ic}</button>
            ))}
          </div>
          <label>Presupuesto mensual (ARS)</label>
          <input type="number" value={ncPresup} onChange={e => { setNcPresup(e.target.value); setNcErrors(p=>({...p,presup:undefined})) }} placeholder="0" min="0" />
          {ncErrors.presup && <span className="field-error">{ncErrors.presup}</span>}
          <div style={{display:'flex', gap:8, marginTop:'1.5rem'}}>
            <button className="btn" style={{flex:1}} onClick={() => setShowNewCat(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={handleCrearCategoria}>Crear</button>
          </div>
        </Modal>
      )}

      {/* Sub-modal: nuevo medio */}
      {showNewMedio && (
        <Modal title="Nuevo medio de pago" onClose={() => setShowNewMedio(false)}>
          <label>Nombre</label>
          <input value={nmNombre} onChange={e => { setNmNombre(e.target.value); setNmError('') }} placeholder="Ej: Banco Galicia" />
          {nmError && <span className="field-error">{nmError}</span>}
          <div style={{display:'flex', gap:8, marginTop:'1.5rem'}}>
            <button className="btn" style={{flex:1}} onClick={() => setShowNewMedio(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={handleCrearMedio}>Crear</button>
          </div>
        </Modal>
      )}
    </>
  )
}
