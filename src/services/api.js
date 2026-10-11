import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vehixToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

export function apiErrorMessage(error, fallback) {
  const responseMessage = error.response?.data?.message
  if (responseMessage) return responseMessage
  if (error.request) return 'The server could not be reached. Make sure the backend is running, then try again.'
  return error.message || fallback
}

export function vehicleImageUrl(imagePath, fallback) {
  if (!imagePath) return fallback
  if (/^https?:\/\//i.test(imagePath)) return imagePath
  return new URL(imagePath, new URL(api.defaults.baseURL, window.location.origin)).toString()
}
