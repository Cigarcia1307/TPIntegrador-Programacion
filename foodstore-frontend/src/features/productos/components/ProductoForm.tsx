import { useForm } from '@tanstack/react-form'
import type {
  Producto,
  ProductoFormData,
  Categoria,
} from '../../../types'

interface ProductoFormProps {
  producto: Producto | null
  categorias: Categoria[]
  guardando: boolean
  error: string
  onGuardar: (datos: ProductoFormData) => void
  onCancelar: () => void
}

function ProductoForm({
  producto,
  categorias,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria_id: producto?.categoria_id ?? 0,
      precio_base: producto?.precio_base ?? 0,
      stock: producto?.stock ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      disponible: producto?.disponible ?? true,
    },

    onSubmit: ({ value }) => {
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        categoria_id: value.categoria_id,
        precio_base: value.precio_base,
        stock: value.stock,
        imagen_url: value.imagen_url.trim() || null,
        disponible: value.disponible,
      })
    },
  })

  const estiloInput =
    'w-full rounded-xl border border-[#DCE2D2] bg-white p-3 outline-none focus:border-[#788B50]'

  const estiloLabel =
    'mb-1 block font-semibold text-[#4B5C29]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-producto-form"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >

        <h2
          id="titulo-producto-form"
          className="mb-2 text-2xl font-bold text-[#4B5C29]"
        >
          {producto ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <p className="mb-6 text-sm text-[#829069]">
          Completá los datos del producto.
        </p>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >

          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value.trim()
                  ? 'Ingresá el nombre del producto.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="producto-nombre"
                  className={estiloLabel}
                >
                  Nombre
                </label>

                <input
                  id="producto-nombre"
                  type="text"
                  required
                  disabled={guardando}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
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

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label
                  htmlFor="producto-descripcion"
                  className={estiloLabel}
                >
                  Descripción
                </label>

                <textarea
                  id="producto-descripcion"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  disabled={guardando}
                  rows={3}
                  className={estiloInput}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) =>
                value <= 0
                  ? 'Seleccioná una categoría.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="producto-categoria"
                  className={estiloLabel}
                >
                  Categoría
                </label>

                <select
                  id="producto-categoria"
                  required
                  disabled={guardando}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value))
                  }
                  className={estiloInput}
                >
                  <option value="">
                    Seleccionar categoría
                  </option>

                  {producto &&
                    !categorias.some(
                      (c) => c.id === producto.categoria_id
                    ) && (
                      <option value={producto.categoria_id}>
                        {producto.categoria.nombre} (inactiva)
                      </option>
                    )}

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.id}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </select>

                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                !Number.isFinite(value) || value < 0
                  ? 'El precio debe ser mayor o igual a cero.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="producto-precio"
                  className={estiloLabel}
                >
                  Precio base
                </label>

                <input
                  id="producto-precio"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  disabled={guardando}
                  value={
                    Number.isFinite(field.state.value)
                      ? field.state.value
                      : ''
                  }
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.valueAsNumber)
                  }
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

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                !Number.isInteger(value) || value < 0
                  ? 'El stock debe ser un entero mayor o igual a cero.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="producto-stock"
                  className={estiloLabel}
                >
                  Stock (unidades)
                </label>

                <input
                  id="producto-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  disabled={guardando}
                  value={
                    Number.isFinite(field.state.value)
                      ? field.state.value
                      : ''
                  }
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.valueAsNumber)
                  }
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

          <form.Field name="imagen_url">
            {(field) => (
              <div>
                <label
                  htmlFor="producto-imagen"
                  className={estiloLabel}
                >
                  URL de imagen (opcional)
                </label>

                <input
                  id="producto-imagen"
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  disabled={guardando}
                  placeholder="https://..."
                  className={estiloInput}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-3 text-[#4B5C29]">

                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.checked)
                  }
                  disabled={guardando}
                  className="h-4 w-4 accent-[#788B50]"
                />

                Producto disponible
              </label>
            )}
          </form.Field>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              disabled={guardando}
              onClick={onCancelar}
              className="rounded-xl bg-[#F3F4F2] px-5 py-2 font-semibold text-[#4B5C29] disabled:opacity-50"
            >
              Cancelar
            </button>

            <form.Subscribe
              selector={(state) => state.canSubmit}
            >
              {(canSubmit) => (
                <button
                  type="submit"
                  disabled={!canSubmit || guardando}
                  className="rounded-xl bg-[#788B50] px-5 py-2 font-semibold text-white hover:bg-[#4B5C29] disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              )}
            </form.Subscribe>

          </div>

        </form>
      </div>
    </div>
  )
}

export default ProductoForm