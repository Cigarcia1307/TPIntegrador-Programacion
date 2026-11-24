import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api, obtenerMensajeError } from '../../../shared/api/client'
import BadgeEstado from '../../../shared/ui/BadgeEstado'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import Modal from '../../../shared/ui/Modal'
import { useAuthStore } from '../../../store/authStore'
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

const formatoFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-AR')



export default function MisPedidos() {
  const queryClient = useQueryClient()
  const usuario = useAuthStore((state) => state.usuario)

  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pedidoId, setPedidoId] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState('')

  const limite = 10

  const consulta = useQuery({
    queryKey: ['pedidos', usuario?.id, pagina, estado],

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

    enabled: !!usuario,
  })

  const detalle = useQuery({
    queryKey: ['pedidos', 'detalle', usuario?.id, pedidoId],

    queryFn: async () => {
      const respuesta = await api.get<Pedido>(
        `/pedidos/${pedidoId}`
      )

      return respuesta.data
    },

    enabled: pedidoId !== null && !!usuario,
  })

  const cancelar = useMutation({
    mutationFn: async (id: number) => {
      const respuesta = await api.patch<Pedido>(
        `/pedidos/${id}/cancelar`
      )

      return respuesta.data
    },

    onSuccess: async (pedido) => {
      setMensaje(
        `El pedido N.º ${pedido.id} fue cancelado.`
      )

      setPedidoId(null)
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

  function cancelarPedido(id: number) {
    if (
      window.confirm(
        `¿Querés cancelar el pedido N.º ${id}?`
      )
    ) {
      setMensaje('')
      cancelar.mutate(id)
    }
  }

  const pedidos = consulta.data?.items ?? []
  const total = consulta.data?.total ?? 0
  const pedidoSeleccionado = detalle.data

  const error =
    consulta.error || cancelar.error

  return (
    <section className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-[#4B5C29]">
          Mis pedidos
        </h2>

        <p className="mt-2 text-[#829069]">
          Consultá el estado de tus compras.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="filtro-estado"
          className="font-semibold text-[#4B5C29]"
        >
          Filtrar por estado:
        </label>

        <select
          id="filtro-estado"
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
          className="space-y-4"
          aria-label="Cargando pedidos"
        >
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="h-32 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      ) : consulta.isError ? (
        <button
          onClick={() => void consulta.refetch()}
          className="rounded-xl bg-[#788B50] px-5 py-2 text-white"
        >
          Reintentar
        </button>
      ) : pedidos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[#829069]">
            No hay pedidos para mostrar.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <h3 className="text-lg font-bold text-[#4B5C29]">
                    Pedido N.º {pedido.id}
                  </h3>

                  <p className="text-sm text-[#829069]">
                    {formatoFecha(pedido.created_at)}
                  </p>
                </div>

                <BadgeEstado estado={pedido.estado} />

                <span className="text-lg font-bold text-[#4B5C29]">
                  {formatoPrecio(pedido.total)}
                </span>

              </div>

              <div className="mt-5 flex flex-wrap gap-3">

                <Button
                  onClick={() => setPedidoId(pedido.id)}
                  className="bg-[#788B50] text-white"
                >
                  Ver detalle
                </Button>

                {pedido.estado === 'PENDIENTE' && (
                  <button
                    type="button"
                    onClick={() => cancelarPedido(pedido.id)}
                    disabled={cancelar.isPending}
                    className="rounded-xl border border-red-500 px-5 py-2 font-semibold text-red-600 disabled:opacity-50"
                  >
                    {cancelar.isPending &&
                    cancelar.variables === pedido.id
                      ? 'Cancelando...'
                      : 'Cancelar pedido'}
                  </button>
                )}

              </div>
            </div>
          ))}
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
        <Modal
          titulo={`Pedido N.º ${pedidoId}`}
          onCerrar={() => setPedidoId(null)}
        >

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

                <div className="max-h-72 space-y-3 overflow-y-auto">

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

                <div className="mt-5 flex justify-between border-t pt-4">

                  <span className="font-bold text-[#4B5C29]">
                    Total
                  </span>

                  <span className="font-bold text-[#4B5C29]">
                    {formatoPrecio(pedidoSeleccionado.total)}
                  </span>

                </div>
              </>
            )}

        </Modal>
      )}

    </section>
  )
}