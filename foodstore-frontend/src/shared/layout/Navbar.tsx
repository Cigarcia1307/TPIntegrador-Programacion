import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import {
  useCarritoStore,
  calcularCantidadCarrito,
} from '../../store/carritoStore'

export default function Navbar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const usuario = useAuthStore((state) => state.usuario)
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion)

  const items = useCarritoStore((state) => state.items)
  const vaciarCarrito = useCarritoStore(
    (state) => state.vaciarCarrito
  )

  const cantidadCarrito = calcularCantidadCarrito(items)
  const esAdmin = usuario?.role === 'admin'

  async function salir() {
    await cerrarSesion()

    if (!useAuthStore.getState().usuario) {
      vaciarCarrito()
      queryClient.clear()
      navigate('/login', { replace: true })
    }
  }

  function enlace(nombre: string, destino: string) {
    return (
      <NavLink
        key={destino}
        to={destino}
        end
        className={({ isActive }) =>
          `rounded-xl px-4 py-3 text-sm font-semibold transition ${
            isActive
              ? 'bg-[#788B50] text-white'
              : 'bg-white text-[#4B5C29] hover:bg-[#F2DF9B]'
          }`
        }
      >
        {nombre}
      </NavLink>
    )
  }

  return (
    <>
      <header className="bg-[#788B50] px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">

          <Link to="/">
            <h1 className="text-3xl font-bold">
              FoodStore
            </h1>

            <p className="mt-1 text-sm text-[#FAF6EC]">
              {esAdmin
                ? 'Gestión de productos y pedidos'
                : 'Tu tienda online'}
            </p>
          </Link>

          {usuario ? (
            <div className="flex flex-wrap items-center gap-3">

              <span className="rounded-full bg-[#EAF1CF] px-4 py-2 text-sm font-semibold text-[#4B5C29]">
                {esAdmin ? 'Administrador' : 'Cliente'}
                {' · '}
                {usuario.full_name}
              </span>

              <button
                type="button"
                onClick={() => void salir()}
                className="rounded-xl border border-white px-4 py-2 font-semibold hover:bg-white hover:text-[#4B5C29]"
              >
                Cerrar sesión
              </button>

            </div>
          ) : (
            <div className="flex flex-wrap gap-3">

              <Link
                to="/login"
                className="rounded-xl border border-white px-4 py-2 font-semibold"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-[#F2DF9B] px-4 py-2 font-semibold text-[#4B5C29]"
              >
                Registrarme
              </Link>

            </div>
          )}

        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 pt-8">
        <nav className="flex flex-wrap gap-3 border-b border-[#DCE2D2] pb-5">

          {enlace('Catálogo', '/')}

          {!esAdmin &&
            enlace(
              `Carrito (${cantidadCarrito})`,
              '/carrito'
            )}

          {usuario && !esAdmin &&
            enlace('Mis pedidos', '/mis-pedidos')}

          {esAdmin && (
            <>
              {enlace('Resumen', '/admin/resumen')}
              {enlace('Categorías', '/admin/categorias')}
              {enlace('Productos', '/admin/productos')}
              {enlace('Pedidos de clientes', '/admin/pedidos')}
              {enlace('Usuarios', '/admin/usuarios')}
            </>
          )}

        </nav>
      </div>
    </>
  )
}