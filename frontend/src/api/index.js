import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// ── Categorías ────────────────────────────────────────────
export const getCategorias = () => api.get('/categorias/').then(r => r.data)
export const createCategoria = (data) => api.post('/categorias/', data).then(r => r.data)
export const updateCategoria = (id, data) => api.patch(`/categorias/${id}`, data).then(r => r.data)

// ── Medios de pago ────────────────────────────────────────
export const getMedios = () => api.get('/medios/').then(r => r.data)
export const createMedio = (data) => api.post('/medios/', data).then(r => r.data)
export const deleteMedio = (id) => api.delete(`/medios/${id}`)

// ── Gastos ────────────────────────────────────────────────
export const getGastos = (params) => api.get('/gastos/', { params }).then(r => r.data)
export const getMesesConDatos = () => api.get('/gastos/meses').then(r => r.data)
export const createGasto = (data) => api.post('/gastos/', data).then(r => r.data)
export const updateGasto = (id, data) => api.patch(`/gastos/${id}`, data).then(r => r.data)
export const deleteGasto = (id) => api.delete(`/gastos/${id}`)
