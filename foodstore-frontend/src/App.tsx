import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import AppRouter from './routes/AppRouter'

function App() {
  const verificarSesion = useAuthStore(
    (state) => state.verificarSesion
  )

  const [inicializando, setInicializando] = useState(true)

  useEffect(() => {
    void verificarSesion().finally(() => {
      setInicializando(false)
    })
  }, [verificarSesion])

  if (inicializando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6EC]">
        <p className="font-semibold text-[#788B50]">
          Verificando sesión...
        </p>
      </div>
    )
  }

  return <AppRouter />
}

export default App