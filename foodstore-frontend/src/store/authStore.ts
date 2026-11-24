import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, obtenerMensajeError } from '../shared/api/client'
import type { Usuario } from '../types'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  error: string

  iniciarSesion: (
    username: string,
    password: string
  ) => Promise<boolean>

  registrar: (
    username: string,
    full_name: string,
    email: string,
    password: string
  ) => Promise<boolean>

  verificarSesion: () => Promise<void>
  cerrarSesion: () => Promise<void>
  limpiarSesion: () => void
  limpiarError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      error: '',

      iniciarSesion: async (username, password) => {
        set({ cargando: true, error: '' })

        try {
          const datos = new URLSearchParams()

          datos.append('username', username)
          datos.append('password', password)

          await api.post('/auth/token', datos, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })

          const respuesta = await api.get<Usuario>('/auth/me')

          set({
            usuario: respuesta.data,
            cargando: false,
            error: '',
          })

          return true
        } catch (error) {
          set({
            usuario: null,
            error: obtenerMensajeError(error),
            cargando: false,
          })

          return false
        }
      },

      registrar: async (username, full_name, email, password) => {
        set({ cargando: true, error: '' })

        try {
          await api.post('/auth/register', {
            username,
            full_name,
            email,
            password,
          })

          set({ cargando: false })

          return true
        } catch (error) {
          set({
            error: obtenerMensajeError(error),
            cargando: false,
          })

          return false
        }
      },

      verificarSesion: async () => {
        set({ cargando: true })

        try {
          const respuesta = await api.get<Usuario>('/auth/me')

          set({
            usuario: respuesta.data,
            cargando: false,
            error: '',
          })
        } catch {
          set({
            usuario: null,
            cargando: false,
          })
        }
      },

      cerrarSesion: async () => {
        try {
          await api.post('/auth/logout')

          set({
            usuario: null,
            error: '',
            cargando: false,
          })
        } catch (error) {
          set({
            error: obtenerMensajeError(error),
          })
        }
      },

      limpiarSesion: () =>
        set({
          usuario: null,
          cargando: false,
          error: '',
        }),

      limpiarError: () => set({ error: '' }),
    }),

    {
      name: 'foodstore-auth',

      partialize: (state) => ({
        usuario: state.usuario,
      }),
    }
  )
)

window.addEventListener('auth:unauthorized', () => {
  useAuthStore.getState().limpiarSesion()
})