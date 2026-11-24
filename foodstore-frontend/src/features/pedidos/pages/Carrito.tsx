import { Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, obtenerMensajeError } from '../../../shared/api/client'
import type { Pedido, PedidoCreate, FormaPago } from '../../../types'
import {
  useCarritoStore,
  calcularTotalCarrito,
} from '../../../store/carritoStore'

interface CarritoProps {
  checkout?: boolean
  onCompraExitosa?: () => void
}

export default function Carrito({
  checkout = false,
  onCompraExitosa,
}: CarritoProps) {
  const {
    items,
    quitarProducto,
    cambiarCantidad,
    vaciarCarrito,
  } = useCarritoStore()

  const queryClient = useQueryClient()
  const total = calcularTotalCarrito(items)

  const formatoPrecio = (valor: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(valor)

  const compra = useMutation({
    mutationFn: async (datos: PedidoCreate) => {
      const respuesta = await api.post<Pedido>('/pedidos', datos)
      return respuesta.data
    },

    onSuccess: async () => {
      vaciarCarrito()

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['pedidos'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['resumen'],
        }),
      ])

      onCompraExitosa?.()
    },
  })

  const procesando = compra.isPending

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },

    onSubmit: async ({ value }) => {
      if (!checkout || items.length === 0 || procesando) return

      try {
        await compra.mutateAsync({
          items: items.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
        })
      } catch {
        // El error se muestra mediante compra.error.
      }
    },
  })

  const estiloInput =
    'w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#788B50]'

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold text-[#4B5C29]">
          {checkout ? 'Confirmar pedido' : 'Mi carrito'}
        </h2>

        <span className="rounded-full bg-[#EAF1CF] px-4 py-2 text-sm font-semibold text-[#4B5C29]">
          {items.length} productos
        </span>

      </div>

      {items.length === 0 && (
        <div className="rounded-xl bg-[#F3F4F2] p-6 text-center">

          <p className="text-[#829069]">
            Tu carrito está vacío. Agregá productos para comenzar.
          </p>

          <Link
            to="/"
            className="mt-4 inline-block font-semibold text-[#4B5C29]"
          >
            Volver al catálogo
          </Link>

        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">

          {items.map((item) => (
            <div
              key={item.producto_id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DCE2D2] p-4"
            >

              <div>
                <h3 className="font-bold text-[#4B5C29]">
                  {item.nombre}
                </h3>

                <p className="text-sm text-[#829069]">
                  {formatoPrecio(item.precio_unitario)} por unidad
                </p>
              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    cambiarCantidad(
                      item.producto_id,
                      item.cantidad - 1
                    )
                  }
                  disabled={procesando || item.cantidad <= 1}
                  className="rounded-lg bg-[#EAF1CF] px-3 py-2 font-bold text-[#4B5C29] disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-6 text-center font-semibold">
                  {item.cantidad}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    cambiarCantidad(
                      item.producto_id,
                      item.cantidad + 1
                    )
                  }
                  disabled={
                    procesando ||
                    item.cantidad >= item.stock_disponible
                  }
                  className="rounded-lg bg-[#EAF1CF] px-3 py-2 font-bold text-[#4B5C29] disabled:opacity-40"
                >
                  +
                </button>

              </div>

              <div className="font-bold text-[#4B5C29]">
                {formatoPrecio(
                  item.precio_unitario * item.cantidad
                )}
              </div>

              <button
                type="button"
                onClick={() => quitarProducto(item.producto_id)}
                disabled={procesando}
                className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-40"
              >
                Quitar
              </button>

            </div>
          ))}

          <div className="border-t border-[#DCE2D2] pt-5">

            <div className="mb-5 flex items-center justify-between">

              <span className="text-lg font-semibold text-[#4B5C29]">
                Total estimado
              </span>

              <span className="text-2xl font-bold text-[#4B5C29]">
                {formatoPrecio(total)}
              </span>

            </div>

            {checkout ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  void form.handleSubmit()
                }}
              >

                <h3 className="text-xl font-bold text-[#4B5C29]">
                  Datos de entrega y pago
                </h3>

                <form.Field
                  name="direccion_entrega"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length < 5 ||
                      value.trim().length > 200
                        ? 'Ingresá una dirección de entre 5 y 200 caracteres.'
                        : undefined,
                  }}
                >
                  {(field) => (
                    <div>

                      <label
                        htmlFor={field.name}
                        className="mb-2 block font-semibold text-[#4B5C29]"
                      >
                        Dirección de entrega
                      </label>

                      <input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value)
                        }
                        required
                        minLength={5}
                        maxLength={200}
                        disabled={procesando}
                        placeholder="Calle, número y localidad"
                        className={estiloInput}
                      />

                      {field.state.meta.errors.map((error, i) => (
                        <p key={i} className="text-sm text-red-600">
                          {error}
                        </p>
                      ))}

                    </div>
                  )}
                </form.Field>

                <form.Field name="forma_pago">
                  {(field) => (
                    <div>

                      <label
                        htmlFor={field.name}
                        className="mb-2 block font-semibold text-[#4B5C29]"
                      >
                        Forma de pago
                      </label>

                      <select
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value as FormaPago
                          )
                        }
                        disabled={procesando}
                        className={estiloInput}
                      >

                        <option value="EFECTIVO">
                          Efectivo
                        </option>

                        <option value="TRANSFERENCIA">
                          Transferencia
                        </option>

                      </select>

                    </div>
                  )}
                </form.Field>

                <form.Field name="notas">
                  {(field) => (
                    <div>

                      <label
                        htmlFor={field.name}
                        className="mb-2 block font-semibold text-[#4B5C29]"
                      >
                        Notas (opcional)
                      </label>

                      <textarea
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value)
                        }
                        disabled={procesando}
                        rows={3}
                        placeholder="Indicaciones adicionales"
                        className={estiloInput}
                      />

                    </div>
                  )}
                </form.Field>

                <div className="flex flex-wrap gap-3">

                  <form.Subscribe
                    selector={(state) => [
                      state.canSubmit,
                      state.isSubmitting,
                    ]}
                  >
                    {([canSubmit, isSubmitting]) => (
                      <button
                        type="submit"
                        disabled={
                          !canSubmit ||
                          isSubmitting ||
                          procesando
                        }
                        className="flex-1 rounded-xl bg-[#788B50] px-6 py-3 font-semibold text-white hover:bg-[#4B5C29] disabled:opacity-50"
                      >
                        {procesando
                          ? 'Procesando compra...'
                          : 'Confirmar compra'}
                      </button>
                    )}
                  </form.Subscribe>

                  {!procesando && (
                    <Link
                      to="/carrito"
                      className="rounded-xl border border-[#4B5C29] px-5 py-3 font-semibold text-[#4B5C29]"
                    >
                      Volver al carrito
                    </Link>
                  )}

                </div>

              </form>

            ) : (
              <div className="flex flex-wrap gap-3">

                <Link
                  to="/checkout"
                  className="flex-1 rounded-xl bg-[#788B50] px-6 py-3 text-center font-semibold text-white hover:bg-[#4B5C29]"
                >
                  Continuar compra
                </Link>

                <button
                  type="button"
                  onClick={vaciarCarrito}
                  className="rounded-xl border border-[#4B5C29] px-5 py-3 font-semibold text-[#4B5C29]"
                >
                  Vaciar carrito
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {compra.isError && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 text-red-700"
        >
          {obtenerMensajeError(compra.error)}
        </p>
      )}

    </section>
  )
}