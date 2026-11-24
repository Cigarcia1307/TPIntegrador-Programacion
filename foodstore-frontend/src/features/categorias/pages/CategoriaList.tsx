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
import type { Categoria, CategoriaFormData } from '../../../types'
import CategoriaForm from '../components/CategoriaForm'

function CategoriaList() {
  const queryClient = useQueryClient()

  const [mostrarForm, setMostrarForm] = useState(false)
  const [categoriaEditando, setCategoriaEditando] =
    useState<Categoria | undefined>(undefined)

  const [mensaje, setMensaje] = useState('')

  const consulta = useQuery({
    queryKey: ['categorias'],

    queryFn: async () => {
      const respuesta = await api.get<Categoria[]>('/categorias')
      return respuesta.data
    },
  })

  const guardar = useMutation({
    mutationFn: async (datos: CategoriaFormData) => {
      if (categoriaEditando) {
        await api.put(
          `/categorias/${categoriaEditando.id}`,
          datos
        )
      } else {
        await api.post('/categorias', datos)
      }
    },

    onSuccess: async () => {
      setMensaje(
        categoriaEditando
          ? 'Categoría actualizada correctamente.'
          : 'Categoría creada correctamente.'
      )

      setMostrarForm(false)
      setCategoriaEditando(undefined)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['categorias'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
      ])
    },
  })

  const eliminar = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categorias/${id}`)
    },

    onSuccess: async () => {
      setMensaje('Categoría dada de baja correctamente.')

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['categorias'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
      ])
    },
  })

  function nuevaCategoria() {
    guardar.reset()
    setMensaje('')
    setCategoriaEditando(undefined)
    setMostrarForm(true)
  }

  function editarCategoria(categoria: Categoria) {
    guardar.reset()
    setMensaje('')
    setCategoriaEditando(categoria)
    setMostrarForm(true)
  }

  function eliminarCategoria(categoria: Categoria) {
    if (
      window.confirm(
        `¿Querés dar de baja la categoría "${categoria.nombre}"?`
      )
    ) {
      setMensaje('')
      eliminar.mutate(categoria.id)
    }
  }

  const columnas: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) =>
        row.original.descripcion || 'Sin descripción',
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => (
        <span className="rounded-full bg-[#EAF1CF] px-3 py-1 text-xs font-semibold text-[#4B5C29]">
          {row.original.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => editarCategoria(row.original)}
            disabled={eliminar.isPending}
            className="rounded-lg bg-[#788B50] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminarCategoria(row.original)}
            disabled={eliminar.isPending}
            className="rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
          >
            Dar de baja
          </button>

        </div>
      ),
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

  const error = consulta.error || eliminar.error

  return (
    <section className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-[#4B5C29]">
            Administración de categorías
          </h2>

          <p className="mt-2 text-[#829069]">
            Creá, editá y administrá las categorías del catálogo.
          </p>
        </div>

        <button
          type="button"
          onClick={nuevaCategoria}
          className="rounded-xl bg-[#788B50] px-5 py-3 font-semibold text-white hover:bg-[#4B5C29]"
        >
          + Nueva categoría
        </button>

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
          aria-label="Cargando categorías"
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
          <p className="text-[#829069]">
            No hay categorías para mostrar.
          </p>
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
                      className="px-5 py-4"
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
                      className="px-5 py-4 text-sm"
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

      {mostrarForm && (
        <CategoriaForm
          key={categoriaEditando?.id ?? 'nueva'}
          categoria={categoriaEditando}
          guardando={guardar.isPending}
          error={
            guardar.isError
              ? obtenerMensajeError(guardar.error)
              : ''
          }
          onGuardar={(datos) => guardar.mutate(datos)}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

    </section>
  )
}

export default CategoriaList