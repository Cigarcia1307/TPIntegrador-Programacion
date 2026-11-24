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
import type {
  Producto,
  ProductoFormData,
  ProductosPaginados,
  Categoria,
} from '../../../types'
import ProductoForm from '../components/ProductoForm'

interface StockData {
  id: number
  stock: number
  disponible: boolean
}

export default function AdminProductos() {
  const queryClient = useQueryClient()

  const [mostrarForm, setMostrarForm] = useState(false)
  const [productoEditando, setProductoEditando] =
    useState<Producto | null>(null)

  const [stockEditando, setStockEditando] =
    useState<StockData | null>(null)

  const [mensaje, setMensaje] = useState('')

  const productos = useQuery({
    queryKey: ['productos', 'admin'],

    queryFn: async () => {
      const respuesta = await api.get<ProductosPaginados>(
        '/productos',
        {
          params: {
            skip: 0,
            limit: 100,
          },
        }
      )

      return respuesta.data
    },
  })

  const categorias = useQuery({
    queryKey: ['categorias'],

    queryFn: async () => {
      const respuesta = await api.get<Categoria[]>('/categorias')
      return respuesta.data
    },
  })

  const guardar = useMutation({
    mutationFn: async (datos: ProductoFormData) => {
      if (productoEditando) {
        const cambios: Partial<ProductoFormData> = {
          ...datos,
        }

        if (
          datos.categoria_id === productoEditando.categoria_id
        ) {
          delete cambios.categoria_id
        }

        await api.put(
          `/productos/${productoEditando.id}`,
          cambios
        )
      } else {
        await api.post('/productos', datos)
      }
    },

    onSuccess: async () => {
      setMensaje(
        productoEditando
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.'
      )

      setMostrarForm(false)
      setProductoEditando(null)

      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })

  const eliminar = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/productos/${id}`)
    },

    onSuccess: async () => {
      setMensaje('Producto dado de baja correctamente.')

      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })

  const actualizarStock = useMutation({
    mutationFn: async (datos: StockData) => {
      await api.patch(`/productos/${datos.id}/stock`, {
        stock: datos.stock,
        disponible: datos.disponible,
      })
    },

    onSuccess: async () => {
      setMensaje('Stock y disponibilidad actualizados.')
      setStockEditando(null)

      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })

  function nuevoProducto() {
    guardar.reset()
    setMensaje('')
    setProductoEditando(null)
    setMostrarForm(true)
  }

  function editarProducto(producto: Producto) {
    guardar.reset()
    setMensaje('')
    setProductoEditando(producto)
    setMostrarForm(true)
  }

  function eliminarProducto(producto: Producto) {
    if (
      window.confirm(
        `¿Querés dar de baja "${producto.nombre}"?`
      )
    ) {
      setMensaje('')
      eliminar.mutate(producto.id)
    }
  }

  function editarStock(producto: Producto) {
    actualizarStock.reset()
    setMensaje('')

    setStockEditando({
      id: producto.id,
      stock: producto.stock,
      disponible: producto.disponible,
    })
  }

  const columnas: ColumnDef<Producto>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'nombre',
      header: 'Producto',
    },
    {
      id: 'categoria',
      header: 'Categoría',
      cell: ({ row }) => row.original.categoria.nombre,
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) =>
        row.original.precio_base.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        }),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
    },
    {
      accessorKey: 'disponible',
      header: 'Disponibilidad',

      cell: ({ row }) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            row.original.disponible
              ? 'bg-[#EAF1CF] text-[#4B5C29]'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.original.disponible
            ? 'Disponible'
            : 'No disponible'}
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
            onClick={() => editarProducto(row.original)}
            disabled={eliminar.isPending}
            className="rounded-lg bg-[#788B50] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => editarStock(row.original)}
            disabled={eliminar.isPending}
            className="rounded-lg bg-[#F2DF9B] px-3 py-2 text-sm font-semibold text-[#4B5C29] disabled:opacity-50"
          >
            Stock
          </button>

          <button
            type="button"
            onClick={() => eliminarProducto(row.original)}
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
    data: productos.data?.items ?? [],
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

  const error =
    productos.error ||
    categorias.error ||
    eliminar.error

  return (
    <section className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-[#4B5C29]">
            Administración de productos
          </h2>

          <p className="mt-2 text-[#829069]">
            Gestioná los productos, precios y stock del catálogo.
          </p>
        </div>

        <button
          type="button"
          onClick={nuevoProducto}
          disabled={!categorias.data?.length}
          className="rounded-xl bg-[#788B50] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          + Nuevo producto
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

      {categorias.isSuccess && categorias.data.length === 0 && (
        <p className="rounded-xl bg-[#F2DF9B] p-4 text-[#4B5C29]">
          Primero debés crear una categoría para cargar productos.
        </p>
      )}

      {productos.isPending ? (
        <div
          role="status"
          aria-label="Cargando productos"
          className="h-48 animate-pulse rounded-2xl bg-gray-200"
        />

      ) : productos.isError ? (
        <button
          type="button"
          onClick={() => void productos.refetch()}
          className="rounded-xl bg-[#788B50] px-5 py-2 text-white"
        >
          Reintentar
        </button>

      ) : productos.data?.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          No hay productos para mostrar.
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

      {mostrarForm && (
        <ProductoForm
          key={productoEditando?.id ?? 'nuevo'}
          producto={productoEditando}
          categorias={categorias.data ?? []}
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

      {stockEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Actualizar stock"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >

            <h3 className="mb-5 text-xl font-bold text-[#4B5C29]">
              Actualizar stock y disponibilidad
            </h3>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()

                if (
                  Number.isInteger(stockEditando.stock) &&
                  stockEditando.stock >= 0
                ) {
                  actualizarStock.mutate(stockEditando)
                }
              }}
            >

              <div>
                <label
                  htmlFor="nuevo-stock"
                  className="mb-2 block font-semibold text-[#4B5C29]"
                >
                  Stock (unidades)
                </label>

                <input
                  id="nuevo-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  disabled={actualizarStock.isPending}
                  value={
                    Number.isFinite(stockEditando.stock)
                      ? stockEditando.stock
                      : ''
                  }
                  onChange={(e) =>
                    setStockEditando({
                      ...stockEditando,
                      stock: e.target.valueAsNumber,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-3"
                />
              </div>

              <label className="flex items-center gap-3 text-[#4B5C29]">

                <input
                  type="checkbox"
                  checked={stockEditando.disponible}
                  disabled={actualizarStock.isPending}
                  onChange={(e) =>
                    setStockEditando({
                      ...stockEditando,
                      disponible: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#788B50]"
                />

                Producto disponible

              </label>

              {actualizarStock.isError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-red-700"
                >
                  {obtenerMensajeError(actualizarStock.error)}
                </p>
              )}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  disabled={actualizarStock.isPending}
                  onClick={() => setStockEditando(null)}
                  className="rounded-xl bg-gray-100 px-5 py-2 font-semibold text-[#4B5C29]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    actualizarStock.isPending ||
                    !Number.isInteger(stockEditando.stock) ||
                    stockEditando.stock < 0
                  }
                  className="rounded-xl bg-[#788B50] px-5 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {actualizarStock.isPending
                    ? 'Guardando...'
                    : 'Guardar'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  )
}