import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api, obtenerMensajeError } from '../../../shared/api/client'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import type {
  Pedido,
  PedidosPaginados,
  EstadoPedido,
} from '../../../types'

const formatoPrecio = (valor: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor)



export default function PanelAdmin() {
  const queryClient = useQueryClient()

  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  const [pedidoId, setPedidoId] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState('')

  const limite = 10

  const consulta = useQuery({
    queryKey: ['pedidos', 'admin', pagina, estado],

    queryFn: async () => {
      const respuesta = await api.get<PedidosPaginados>(
        '/pedidos',
        {
          params: {
            skip: pagina * limite,
            limit: limite,
            estado: estado || undefined,
          },
        }
      )

      return respuesta.data
    },
  })

  const detalle = useQuery({
    queryKey: ['pedidos', 'admin', 'detalle', pedidoId],

    queryFn: async () => {
      const respuesta = await api.get<Pedido>(
        `/pedidos/${pedidoId}`
      )

      return respuesta.data
    },

    enabled: pedidoId !== null,
  })

  const cambiarEstado = useMutation({
    mutationFn: async (datos: {
      id: number
      estado: EstadoPedido
    }) => {
      const respuesta = await api.patch<Pedido>(
        `/pedidos/${datos.id}/estado`,
        {
          estado: datos.estado,
        }
      )

      return respuesta.data
    },

    onSuccess: async (pedido) => {
      setMensaje(
        `Pedido N.º ${pedido.id} actualizado a ${pedido.estado.replaceAll('_', ' ')}.`
      )

      setPagina(0)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['pedidos'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['resumen'],
        }),
      ])
    },
  })

  function actualizarEstado(
    id: number,
    nuevoEstado: EstadoPedido
  ) {
    if (
      nuevoEstado === 'CANCELADO' &&
      !window.confirm(`¿Querés cancelar el pedido N.º ${id}?`)
    ) {
      return
    }

    setMensaje('')

    cambiarEstado.mutate({
      id,
      estado: nuevoEstado,
    })
  }

  const pedidos = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0
  const pedidoSeleccionado = detalle.data

  const error = consulta.error || cambiarEstado.error

  return (
    <section className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-[#4B5C29]">
          Administración de pedidos
        </h2>

        <p className="mt-2 text-[#829069]">
          Consultá los pedidos y administrá sus estados.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">

        <label
          htmlFor="estado-admin"
          className="font-semibold text-[#4B5C29]"
        >
          Filtrar por estado:
        </label>

        <select
          id="estado-admin"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoPedido | '')
            setPagina(0)
          }}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2"
        >
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-red-700"
        >
          {obtenerMensajeError(error)}
        </p>
      )}

      {mensaje && (
        <p className="rounded-xl bg-[#EAF1CF] p-4 text-[#4B5C29]">
          {mensaje}
        </p>
      )}

      {consulta.isPending ? (
        <div
          role="status"
          aria-label="Cargando pedidos"
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

      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          No hay pedidos para mostrar.
        </div>

      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">

          <table className="w-full text-left text-sm">

            <thead className="bg-[#EAF1CF] text-[#4B5C29]">
              <tr>
                <th className="p-4">Pedido</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>

              {pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="border-t border-gray-100 hover:bg-[#FAF6EC]"
                >

                  <td className="p-4 font-semibold">
                    #{pedido.id}
                  </td>

                  <td className="p-4">
                    #{pedido.usuario_id}
                  </td>

                  <td className="p-4">
                    {new Date(pedido.created_at).toLocaleString('es-AR')}
                  </td>

                  <td className="p-4 font-semibold">
                    {formatoPrecio(pedido.total)}
                  </td>

                  <td className="p-4">
                    <BadgeEstado
                      estado={pedido.estado}
                      className="px-3 py-1 text-xs"
                    />
                  </td>

                  <td className="p-4">

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() => setPedidoId(pedido.id)}
                        className="rounded-lg bg-[#EAF1CF] px-3 py-2 font-semibold text-[#4B5C29]"
                      >
                        Detalle
                      </button>

                      {pedido.estado === 'PENDIENTE' && (
                        <button
                          type="button"
                          disabled={cambiarEstado.isPending}
                          onClick={() =>
                            actualizarEstado(
                              pedido.id,
                              'EN_PREPARACION'
                            )
                          }
                          className="rounded-lg bg-[#788B50] px-3 py-2 font-semibold text-white disabled:opacity-50"
                        >
                          Preparar
                        </button>
                      )}

                      {pedido.estado === 'EN_PREPARACION' && (
                        <button
                          type="button"
                          disabled={cambiarEstado.isPending}
                          onClick={() =>
                            actualizarEstado(
                              pedido.id,
                              'ENTREGADO'
                            )
                          }
                          className="rounded-lg bg-[#788B50] px-3 py-2 font-semibold text-white disabled:opacity-50"
                        >
                          Entregar
                        </button>
                      )}

                      {(pedido.estado === 'PENDIENTE' ||
                        pedido.estado === 'EN_PREPARACION') && (
                        <button
                          type="button"
                          disabled={cambiarEstado.isPending}
                          onClick={() =>
                            actualizarEstado(
                              pedido.id,
                              'CANCELADO'
                            )
                          }
                          className="rounded-lg border border-red-500 px-3 py-2 font-semibold text-red-600 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

      {total > limite && (
        <div className="flex items-center justify-center gap-4">

          <button
            type="button"
            onClick={() =>
              setPagina((actual) => Math.max(0, actual - 1))
            }
            disabled={pagina === 0 || consulta.isFetching}
            className="rounded-xl bg-white px-5 py-2 font-semibold text-[#4B5C29] disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-[#4B5C29]">
            Página {pagina + 1} de {Math.ceil(total / limite)}
          </span>

          <button
            type="button"
            onClick={() => setPagina((actual) => actual + 1)}
            disabled={
              (pagina + 1) * limite >= total ||
              consulta.isFetching
            }
            className="rounded-xl bg-white px-5 py-2 font-semibold text-[#4B5C29] disabled:opacity-40"
          >
            Siguiente
          </button>

        </div>
      )}

      {pedidoId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del pedido"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >

            <div className="mb-5 flex items-center justify-between">

              <h3 className="text-xl font-bold text-[#4B5C29]">
                Pedido N.º {pedidoId}
              </h3>

              <button
                type="button"
                onClick={() => setPedidoId(null)}
                aria-label="Cerrar detalle"
                className="text-2xl text-gray-500"
              >
                ×
              </button>

            </div>

            {detalle.isPending && (
              <p>Cargando detalle...</p>
            )}

            {detalle.isError && (
              <p className="text-red-600">
                {obtenerMensajeError(detalle.error)}
              </p>
            )}

            {pedidoSeleccionado && (
              <>

                <div className="mb-5 space-y-2 text-sm text-[#4B5C29]">

                  <p>
                    <strong>Usuario: </strong>
                    #{pedidoSeleccionado.usuario_id}
                  </p>

                  <p>
                    <strong>Estado: </strong>
                    {pedidoSeleccionado.estado.replaceAll('_', ' ')}
                  </p>

                  <p>
                    <strong>Dirección: </strong>
                    {pedidoSeleccionado.direccion_entrega}
                  </p>

                  <p>
                    <strong>Forma de pago: </strong>
                    {pedidoSeleccionado.forma_pago}
                  </p>

                  <p>
                    <strong>Notas: </strong>
                    {pedidoSeleccionado.notas || 'Sin notas'}
                  </p>

                </div>

                <div className="space-y-3">

                  {pedidoSeleccionado.items.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex justify-between gap-4 border-b border-gray-100 pb-3"
                    >

                      <div>
                        <p className="font-semibold text-[#4B5C29]">
                          {item.nombre_producto}
                        </p>

                        <p className="text-sm text-[#829069]">
                          {item.cantidad} ×{' '}
                          {formatoPrecio(item.precio_unitario)}
                        </p>
                      </div>

                      <span className="font-semibold text-[#4B5C29]">
                        {formatoPrecio(item.subtotal)}
                      </span>

                    </div>
                  ))}

                </div>

                <div className="mt-5 flex justify-between border-t pt-4 font-bold text-[#4B5C29]">

                  <span>Total</span>

                  <span>
                    {formatoPrecio(pedidoSeleccionado.total)}
                  </span>

                </div>

              </>
            )}

          </div>
        </div>
      )}

    </section>
  )
}