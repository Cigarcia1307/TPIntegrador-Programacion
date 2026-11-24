import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, obtenerMensajeError } from '../../../shared/api/client'
import type { Categoria, ProductosPaginados } from '../../../types'
import ProductoCard from '../components/ProductoCard'
import Input from '../../../shared/ui/Input'
import Paginacion from '../../../shared/components/Paginacion'
import Skeleton from '../../../shared/components/Skeleton'
import EstadoVacio from '../../../shared/components/EstadoVacio'
import EstadoError from '../../../shared/components/EstadoError'

function ProductoList() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [pagina, setPagina] = useState(0)

  const limite = 9

  const categorias = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const respuesta = await api.get<Categoria[]>('/categorias')
      return respuesta.data
    },
  })

  const productos = useQuery({
    queryKey: ['productos', {
      busqueda,
      categoriaId,
      pagina,
      limite,
    }],

    queryFn: async () => {
      const respuesta = await api.get<ProductosPaginados>(
        '/productos',
        {
          params: {
            skip: pagina * limite,
            limit: limite,
            search: busqueda.trim() || undefined,
            categoria_id: categoriaId
              ? Number(categoriaId)
              : undefined,
          },
        }
      )

      return respuesta.data
    },
  })

  const listado = productos.data?.items ?? []
  const total = productos.data?.total ?? 0
  

  return (
    <section className="space-y-6">

      <div>
        <h2 className="text-3xl font-bold text-[#4B5C29]">
          Nuestros productos
        </h2>

        <p className="mt-2 text-[#829069]">
          Encontrá todo lo que necesitás para tu compra.
        </p>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 rounded-2xl bg-white p-5 shadow-sm">

        <div className="min-w-48 flex-1">
          <label
            htmlFor="busqueda"
            className="mb-2 block font-semibold text-[#4B5C29]"
          >
            Buscar producto
          </label>

          <Input
            id="busqueda"
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPagina(0)
            }}
            placeholder="Ej.: arroz, leche, fideos..."
            className="border-gray-300 py-3"
          />
        </div>

        <div className="min-w-48 flex-1">
          <label
            htmlFor="categoria"
            className="mb-2 block font-semibold text-[#4B5C29]"
          >
            Categoría
          </label>

          <select
            id="categoria"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value)
              setPagina(0)
            }}
            disabled={categorias.isPending}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
          >
            <option value="">Todas las categorías</option>

            {categorias.data?.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setBusqueda('')
              setCategoriaId('')
              setPagina(0)
            }}
            className="rounded-xl bg-[#EAF1CF] px-5 py-3 font-semibold text-[#4B5C29]"
          >
            Limpiar filtros
          </button>
        </div>

      </div>

      {categorias.isError && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {obtenerMensajeError(categorias.error)}
        </p>
      )}

      {/* Estado de carga */}
      {productos.isPending ? (
        <Skeleton
          cantidad={6}
          mensaje="Cargando productos"
        />
      ) : productos.isError ? (
        <EstadoError
          mensaje={obtenerMensajeError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      ) : listado.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje="Probá cambiando la búsqueda o la categoría."
        />

      ) : (
        <>
          <p className="text-sm font-medium text-[#829069]">
            {total} productos encontrados
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {listado.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
              />
            ))}

          </div>
        </>
      )}

            {/* Paginación */}
            <Paginacion
              pagina={pagina}
              total={total}
              limite={limite}
              cargando={productos.isFetching}
              onChange={setPagina}
            />

          </section>
        )
    }

export default ProductoList
             

  



