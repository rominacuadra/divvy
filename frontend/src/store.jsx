import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCategorias, getMedios, getGastos } from './api'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [categorias, setCategorias] = useState([])
  const [medios, setMedios] = useState([])
  const [gastos, setGastos] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const fetchCategorias = useCallback(async () => {
    const data = await getCategorias()
    setCategorias(data)
  }, [])

  const fetchMedios = useCallback(async () => {
    const data = await getMedios()
    setMedios(data)
  }, [])

  const fetchGastos = useCallback(async (year, month) => {
    const data = await getGastos({ year, month })
    setGastos(data)
  }, [])

  const refreshGastos = useCallback(() => {
    fetchGastos(currentYear, currentMonth)
  }, [currentYear, currentMonth, fetchGastos])

  useEffect(() => {
    Promise.all([fetchCategorias(), fetchMedios()])
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchGastos(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const changeMonth = (delta) => {
    let m = currentMonth + delta
    let y = currentYear
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setCurrentMonth(m)
    setCurrentYear(y)
  }

  return (
    <StoreContext.Provider value={{
      categorias, setCategorias, fetchCategorias,
      medios, setMedios, fetchMedios,
      gastos, setGastos, fetchGastos, refreshGastos,
      currentMonth, currentYear, changeMonth,
      loading
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
