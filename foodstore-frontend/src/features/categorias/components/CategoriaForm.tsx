import { useForm } from '@tanstack/react-form'
import type { Categoria, CategoriaFormData } from '../../../types'

interface CategoriaFormProps {
  categoria?: Categoria
  guardando: boolean
  error: string
  onGuardar: (datos: CategoriaFormData) => void
  onCancelar: () => void
}

function CategoriaForm({
  categoria,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },

    onSubmit: ({ value }) => {
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      })
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Formulario de categoría"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >

        <h2 className="text-2xl font-bold text-[#4B5C29]">
          {categoria ? 'Editar categoría' : 'Nueva categoría'}
        </h2>

        <p className="mt-2 text-sm text-[#829069]">
          Completá los datos para organizar tus productos.
        </p>

        <form
          className="mt-6 space-y-5"
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
                value.trim().length < 2 ||
                value.trim().length > 100
                  ? 'El nombre debe tener entre 2 y 100 caracteres.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="categoria-nombre"
                  className="mb-2 block font-semibold text-[#4B5C29]"
                >
                  Nombre
                </label>

                <input
                  id="categoria-nombre"
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={guardando}
                  placeholder="Ejemplo: Bebidas"
                  className="w-full rounded-xl border border-[#DCE2D2] px-4 py-3 outline-none focus:border-[#788B50]"
                />

                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="mt-1 text-sm text-red-600">
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
                  htmlFor="categoria-descripcion"
                  className="mb-2 block font-semibold text-[#4B5C29]"
                >
                  Descripción
                </label>

                <textarea
                  id="categoria-descripcion"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  disabled={guardando}
                  rows={3}
                  placeholder="Ejemplo: Gaseosas, aguas y jugos"
                  className="w-full resize-none rounded-xl border border-[#DCE2D2] px-4 py-3 outline-none focus:border-[#788B50]"
                />
              </div>
            )}
          </form.Field>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onCancelar}
              disabled={guardando}
              className="rounded-xl bg-[#F3F4F2] px-5 py-3 font-semibold text-[#4B5C29] disabled:opacity-50"
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
                  className="rounded-xl bg-[#788B50] px-5 py-3 font-semibold text-white transition hover:bg-[#4B5C29] disabled:opacity-50"
                >
                  {guardando
                    ? 'Guardando...'
                    : categoria
                      ? 'Guardar cambios'
                      : 'Guardar categoría'}
                </button>
              )}
            </form.Subscribe>

          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoriaForm