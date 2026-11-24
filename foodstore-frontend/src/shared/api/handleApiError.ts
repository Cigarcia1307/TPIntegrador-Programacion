import axios from 'axios'

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detalle = error.response?.data?.detail

    if (typeof detalle === 'string') {
      return detalle
    }

    if (error.response?.status === 401) {
      return 'Tenés que iniciar sesión.'
    }

    if (error.response?.status === 403) {
      return 'No tenés permisos para realizar esta operación.'
    }

    if (error.response?.status === 422) {
      return 'Revisá los datos ingresados.'
    }

    if (!error.response) {
      return 'No se pudo conectar con el servidor.'
    }
  }

  return 'Ocurrió un error inesperado.'
}