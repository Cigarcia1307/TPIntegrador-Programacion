import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const detalle = error.response?.data?.detail
      const url = error.config?.url ?? ''

      const esLogin = url.endsWith('/auth/token')
      const esVerificacion = url.endsWith('/auth/me')

      const sesionExpirada =
        status === 401 &&
        !esLogin &&
        !esVerificacion

      const cuentaDesactivada =
        status === 400 &&
        detalle === 'Cuenta de usuario desactivada'

      if (sesionExpirada || cuentaDesactivada) {
        window.dispatchEvent(
          new Event('auth:unauthorized')
        )
      }
    }

    return Promise.reject(error)
  },
)

export { obtenerMensajeError } from './handleApiError'