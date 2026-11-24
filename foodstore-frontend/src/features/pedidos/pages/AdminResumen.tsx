import { useQuery } from '@tanstack/react-query'
import { api, obtenerMensajeError } from '../../../shared/api/client'
import type { ResumenPedidos } from '../../../types'

export default function AdminResumen() {
  const consulta = useQuery({
    queryKey: ['resumen'],

    queryFn: async () => {
      const respuesta = await api.get<ResumenPedidos>(
        '/pedidos/resumen'
      )

      return respuesta.data
    },
  })

  const resumen = consulta.data

  const indicadores = resumen
    ? [
        {
          titulo: 'Pedidos pendientes',
          valor: resumen.pendientes,
          color: 'bg-yellow-100 text-yellow-800',
        },
        {
          titulo: 'En preparación',
          valor: resumen.en_preparacion,
          color: 'bg-blue-100 text-blue-800',
        },
        {
          titulo: 'Pedidos entregados',
          valor: resumen.entregados,
          color: 'bg-green-100 text-green-800',
        },
        {
          titulo: 'Pedidos cancelados',
          valor: resumen.cancelados,
          color: 'bg-red-100 text-red-800',
        },
        {
          titulo: 'Pedidos de hoy',
          valor: resumen.pedidos_hoy,
          color: 'bg-[#EAF1CF] text-[#4B5C29]',
        },
        {
          titulo: 'Ingresos por pedidos entregados',
          valor: resumen.ingresos_entregados.toLocaleString(
            'es-AR',
            {
              style: 'currency',
              currency: 'ARS',
            }
          ),
          color: 'bg-[#F2DF9B] text-[#4B5C29]',
        },
      ]
    : []

  return (
    <section className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-[#4B5C29]">
          Resumen administrativo
        </h2>

        <p className="mt-2 text-[#829069]">
          Consultá los indicadores de pedidos y ventas de FoodStore.
        </p>
      </div>

      {consulta.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}

        </div>

      ) : consulta.isError ? (
        <div className="rounded-xl bg-red-50 p-5 text-red-700">

          <p role="alert">
            {obtenerMensajeError(consulta.error)}
          </p>

          <button
            type="button"
            onClick={() => void consulta.refetch()}
            className="mt-4 rounded-xl bg-[#788B50] px-5 py-2 text-white"
          >
            Reintentar
          </button>

        </div>

      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {indicadores.map((indicador) => (
            <article
              key={indicador.titulo}
              className={`rounded-2xl p-6 shadow-sm ${indicador.color}`}
            >

              <p className="text-sm font-semibold">
                {indicador.titulo}
              </p>

              <p className="mt-4 text-3xl font-bold">
                {indicador.valor}
              </p>

            </article>
          ))}

        </div>
      )}

    </section>
  )
}