export const ICONS = [
  '🍔','🛒','🚗','🏠','💊','🎬','👗','📚','✈️','🐾',
  '🎮','🏋️','💡','📱','🍷','☕','🎁','💰','🏥','⛽',
  '🏦','🧴','🎶','🍕','🛠️','💼','🌿','🎓'
]

export function genId() {
  return 'id_' + Date.now() + Math.random().toString(36).slice(2, 7)
}

export function fmt(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(n)
}

export function fmtMon(n, mon) {
  if (mon === 'USD') return 'USD ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n)
  if (mon === 'EUR') return '€' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n)
  return fmt(n)
}

export function getMonthName(month, year) {
  const mes = new Intl.DateTimeFormat('es-AR', { month: 'long' })
    .format(new Date(year, month - 1, 1))
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1)
  return `${mesCapitalizado} ${year}`
}

export function toCSV(gastos, categorias, medios) {
  const headers = ['Fecha','Descripción','Categoría','Medio de pago','Tipo','Moneda','Monto'] // TODO: agregar 'Splitwise' cuando se implemente multi-usuario
  const rows = gastos.map(g => {
    const cat = categorias.find(c => c.id === g.categoria_id)
    const med = medios.find(m => m.id === g.medio_pago_id)
    // const sw = g.tipo === 'compartido' ? (g.splitwise ? 'Sí' : 'No') : '—'  // TODO: habilitar con multi-usuario
    return [g.fecha, g.descripcion, cat?.nombre || '', med?.nombre || '', g.tipo, g.moneda, g.monto.toFixed(2)]
  })
  return [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}
