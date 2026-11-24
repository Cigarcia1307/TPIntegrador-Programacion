import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  roles?: ('admin' | 'user')[]
}

export default function ProtectedRoute({
  roles,
}: ProtectedRouteProps) {
  const { usuario, cargando } = useAuthStore()

  if (cargando) {
    return (
      <p className="p-6 text-[#829069]">
        Verificando sesión...
      </p>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}