import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from 'react-router-dom'

import MainLayout from '../shared/layout/MainLayout'

import ProductoList from '../features/productos/pages/ProductoList'
import CategoriaList from '../features/categorias/pages/CategoriaList'
import AuthForm from '../features/auth/pages/AuthForm'
import Carrito from '../features/pedidos/pages/Carrito'
import MisPedidos from '../features/pedidos/pages/MisPedidos'
import PanelAdmin from '../features/pedidos/pages/PanelAdmin'
import AdminProductos from '../features/productos/pages/AdminProductos'
import AdminResumen from '../features/pedidos/pages/AdminResumen'
import AdminUsuarios from '../features/usuarios/pages/AdminUsuarios'

import { useAuthStore } from '../store/authStore'
import ProtectedRoute from './ProtectedRoute'

export default function AppRouter() {
  const navigate = useNavigate()

  const usuario = useAuthStore((state) => state.usuario)
  const esAdmin = usuario?.role === 'admin'

  return (
    <MainLayout>

      <Routes>

        <Route
          path="/"
          element={<ProductoList />}
        />

        <Route
          path="/login"
          element={
            usuario
              ? <Navigate to={esAdmin ? '/admin/resumen' : '/'} replace />
              : <AuthForm />
          }
        />

        <Route
          path="/register"
          element={
            usuario
              ? <Navigate to="/" replace />
              : <AuthForm />
          }
        />

        <Route
          path="/carrito"
          element={<Carrito checkout={false} />}
        />

        <Route element={<ProtectedRoute />}>

          <Route
            path="/checkout"
            element={
              <Carrito
                checkout={true}
                onCompraExitosa={() =>
                  navigate('/mis-pedidos')
                }
              />
            }
          />

          <Route
            path="/mis-pedidos"
            element={
              esAdmin
                ? <Navigate to="/admin/pedidos" replace />
                : <MisPedidos />
            }
          />

        </Route>

        <Route
          element={<ProtectedRoute roles={['admin']} />}
        >

          <Route
            path="/admin/resumen"
            element={<AdminResumen />}
          />

          <Route
            path="/admin/categorias"
            element={<CategoriaList />}
          />

          <Route
            path="/admin/productos"
            element={<AdminProductos />}
          />

          <Route
            path="/admin/pedidos"
            element={<PanelAdmin />}
          />

          <Route
            path="/admin/usuarios"
            element={<AdminUsuarios />}
          />

        </Route>

        <Route
          path="/unauthorized"
          element={
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

              <h2 className="text-2xl font-bold text-red-700">
                Acceso no autorizado
              </h2>

              <p className="my-4 text-gray-600">
                No tenés permisos para acceder a esta sección.
              </p>

              <Link
                to="/"
                className="font-semibold text-[#788B50]"
              >
                Volver al catálogo
              </Link>

            </div>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </MainLayout>
  )
}