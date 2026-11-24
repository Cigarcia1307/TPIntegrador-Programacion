import type { Producto } from '../../../types'
import { useCarritoStore } from '../../../store/carritoStore'

interface ProductoCardProps {
  producto: Producto
}

function ProductoCard({ producto }: ProductoCardProps) {
  const agregarProducto = useCarritoStore(
    (state) => state.agregarProducto
  )

  const puedeComprar =
    producto.activo &&
    producto.disponible &&
    producto.stock > 0

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E4E8DC] bg-white shadow-sm">

      <div className="h-2 bg-[#788B50]" />

      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-[#FAF6EC] text-5xl">
          🛒
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">

        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-[#4B5C29]">
            {producto.nombre}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              producto.disponible
                ? 'bg-[#EAF1CF] text-[#4B5C29]'
                : 'bg-[#FCE9D1] text-[#9A6538]'
            }`}
          >
            {producto.disponible
              ? 'Disponible'
              : 'No disponible'}
          </span>
        </div>

        {producto.categoria && (
          <div className="mb-4">
            <span className="rounded-lg bg-[#EAF1CF] px-3 py-1 text-xs font-semibold text-[#4B5C29]">
              {producto.categoria.nombre}
            </span>
          </div>
        )}

        {producto.descripcion && (
          <p className="mb-5 text-sm text-[#829069]">
            {producto.descripcion}
          </p>
        )}

        <div className="mb-5 rounded-xl bg-[#F2DF9B] p-4">
          <p className="text-xs font-medium text-[#4B5C29]">
            Precio por unidad
          </p>

          <p className="mt-1 text-2xl font-bold text-[#4B5C29]">
            {producto.precio_base.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#E4E8DC] pt-4">

          <div>
            <p className="text-xs text-[#829069]">
              Stock
            </p>

            <p className="font-semibold text-[#4B5C29]">
              {producto.stock} unidades
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              producto.stock > 0
                ? 'bg-[#EAF1CF] text-[#4B5C29]'
                : 'bg-[#FCE9D1] text-[#9A6538]'
            }`}
          >
            {producto.stock > 0
              ? 'Con stock'
              : 'Sin stock'}
          </span>

        </div>

        <div className="mt-auto pt-6">

          <button
            type="button"
            disabled={!puedeComprar}
            onClick={() => agregarProducto(producto)}
            className="w-full rounded-xl bg-[#788B50] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4B5C29] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {puedeComprar
              ? 'Agregar al carrito'
              : 'No disponible para comprar'}
          </button>

        </div>
      </div>
    </article>
  )
}

export default ProductoCard