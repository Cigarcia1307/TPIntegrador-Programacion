import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { api, obtenerMensajeError } from '../../../shared/api/client'
import { useAuthStore } from '../../../store/authStore'
import type { Usuario } from '../../../types'

export default function AdminUsuarios() {
  const queryClient = useQueryClient()

  const usuarioActual = useAuthStore(
    (state) => state.usuario
  )

  const [mensaje, setMensaje] = useState('')

  const consulta = useQuery({
    queryKey: ['usuarios', 'admin'],

    queryFn: async () => {
      const respuesta = await api.get<Usuario[]>(
        '/admin/usuarios'
      )

      return respuesta.data
    },
  })

  const cambiarEstado = useMutation({
    mutationFn: async (datos: {
      id: number
      activar: boolean
    }) => {
      const accion = datos.activar
        ? 'activar'
        : 'desactivar'

      const respuesta = await api.post<Usuario>(
        `/admin/usuarios/${datos.id}/${accion}`
      )

      return respuesta.data
    },

    onSuccess: async (usuario) => {
      setMensaje(
        usuario.disabled
          ? 'Usuario desactivado correctamente.'
          : 'Usuario activado correctamente.'
      )

      await queryClient.invalidateQueries({
        queryKey: ['usuarios'],
      })
    },
  })

  function modificarUsuario(usuario: Usuario) {
    const accion = usuario.disabled
      ? 'activar'
      : 'desactivar'

    if (
      !window.confirm(
        `¿Querés ${accion} al usuario "${usuario.username}"?`
      )
    ) {
      return
    }

    setMensaje('')

    cambiarEstado.mutate({
      id: usuario.id,
      activar: usuario.disabled,
    })
  }

  const columnas: ColumnDef<Usuario>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'username',
      header: 'Usuario',
    },
    {
      accessorKey: 'full_name',
      header: 'Nombre completo',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Rol',

      cell: ({ row }) => (
        <span className="rounded-full bg-[#EAF1CF] px-3 py-1 text-xs font-semibold text-[#4B5C29]">
          {row.original.role === 'admin'
            ? 'Administrador'
            : 'Cliente'}
        </span>
      ),
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',

      cell: ({ row }) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.original.disabled
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.original.disabled
            ? 'Desactivado'
            : 'Activo'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',

      cell: ({ row }) => {
        const usuario = row.original

        if (usuario.id === usuarioActual?.id) {
          return (
            <span className="text-sm text-gray-500">
              Tu cuenta
            </span>
          )
        }

        return (
          <button
            type="button"
            disabled={cambiarEstado.isPending}
            onClick={() => modificarUsuario(usuario)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              usuario.disabled
                ? 'bg-[#788B50] text-white'
                : 'border border-red-500 text-red-600'
            }`}
          >
            {cambiarEstado.isPending &&
            cambiarEstado.variables?.id === usuario.id
              ? 'Procesando...'
              : usuario.disabled
                ? 'Activar'
                : 'Desactivar'}
          </button>
        )
      },
    },
  ]

  const tabla = useReactTable({
    data: consulta.data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  })

  const error = consulta.error || cambiarEstado.error

  return (
    <section className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-[#4B5C29]">
          Administración de usuarios
        </h2>

        <p className="mt-2 text-[#829069]">
          Consultá las cuentas registradas y administrá su acceso.
        </p>
      </div>

      {mensaje && (
        <p className="rounded-xl bg-[#EAF1CF] p-4 text-[#4B5C29]">
          {mensaje}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-red-700"
        >
          {obtenerMensajeError(error)}
        </p>
      )}

      {consulta.isPending ? (
        <div
          role="status"
          aria-label="Cargando usuarios"
          className="h-48 animate-pulse rounded-2xl bg-gray-200"
        />

      ) : consulta.isError ? (
        <button
          type="button"
          onClick={() => void consulta.refetch()}
          className="rounded-xl bg-[#788B50] px-5 py-2 text-white"
        >
          Reintentar
        </button>

      ) : consulta.data?.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          No hay usuarios registrados.
        </div>

      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">

          <table className="w-full text-left">

            <thead className="bg-[#EAF1CF] text-[#4B5C29]">

              {tabla.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>

                  {grupo.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}

                </tr>
              ))}

            </thead>

            <tbody>

              {tabla.getRowModel().rows.map((fila) => (
                <tr
                  key={fila.id}
                  className="border-b border-gray-100 hover:bg-[#FAF6EC]"
                >

                  {fila.getVisibleCells().map((celda) => (
                    <td
                      key={celda.id}
                      className="px-4 py-4 text-sm"
                    >
                      {flexRender(
                        celda.column.columnDef.cell,
                        celda.getContext()
                      )}
                    </td>
                  ))}

                </tr>
              ))}

            </tbody>

          </table>

          <div className="flex flex-wrap items-center justify-center gap-4 p-4">

            <button
              type="button"
              onClick={() => tabla.previousPage()}
              disabled={!tabla.getCanPreviousPage()}
              className="rounded-lg bg-[#EAF1CF] px-4 py-2 font-semibold text-[#4B5C29] disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="text-sm text-[#4B5C29]">
              Página {tabla.getState().pagination.pageIndex + 1}
              {' de '}
              {tabla.getPageCount()}
            </span>

            <button
              type="button"
              onClick={() => tabla.nextPage()}
              disabled={!tabla.getCanNextPage()}
              className="rounded-lg bg-[#EAF1CF] px-4 py-2 font-semibold text-[#4B5C29] disabled:opacity-40"
            >
              Siguiente
            </button>

          </div>

        </div>
      )}

    </section>
  )
}