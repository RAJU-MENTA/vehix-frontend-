import { useCallback, useEffect, useState } from 'react'
import { api, apiErrorMessage } from '../services/api.js'

export function useVehicleData(filters = {}) {
  const { search = '', category = '', location = '', minPrice = '', maxPrice = '', sort = '' } = filters
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadVehicles = useCallback(async (signal) => {
    try {
      const params = {}
      if (search.trim()) params.q = search.trim()
      if (category) params.category = category
      if (location.trim()) params.location = location.trim()
      if (minPrice !== '') params.minPrice = minPrice
      if (maxPrice !== '') params.maxPrice = maxPrice
      if (sort) params.sort = sort

      const result = await api.get('/vehicles', { params, signal })
      setVehicles(Array.isArray(result.data) ? result.data : [])
      setError('')
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') {
        setError(apiErrorMessage(requestError, 'Could not load vehicles.'))
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [search, category, location, minPrice, maxPrice, sort])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    loadVehicles(controller.signal)

    const refresh = () => loadVehicles(controller.signal)
    const intervalId = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    return () => {
      controller.abort()
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
    }
  }, [loadVehicles])

  return { vehicles, loading, error, refresh: () => loadVehicles() }
}
