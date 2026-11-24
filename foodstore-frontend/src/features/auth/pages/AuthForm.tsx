import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '../../../store/authStore'

export default function AuthForm() {
  const location = useLocation()
  const navigate = useNavigate()

  const modoRegistro = location.pathname === '/register'

  const {
    iniciarSesion,
    registrar,
    cargando,
    error,
    limpiarError,
  } = useAuthStore()

  useEffect(() => {
    limpiarError()
  }, [modoRegistro, limpiarError])

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      if (modoRegistro) {
        const registrado = await registrar(
          value.username.trim(),
          value.full_name.trim(),
          value.email.trim(),
          value.password
        )

        if (registrado) {
          form.reset()

          navigate('/login', {
            replace: true,
            state: { registrado: true },
          })
        }
      } else {
        await iniciarSesion(
          value.username.trim(),
          value.password
        )
      }
    },
  })

  const estiloInput =
    'w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#788B50]'

  const estiloLabel =
    'mb-2 block font-semibold text-[#4B5C29]'

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-8">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8 text-center">

          <h2 className="text-3xl font-bold text-[#4B5C29]">
            {modoRegistro
              ? 'Crear cuenta'
              : 'Bienvenido a FoodStore'}
          </h2>

          <p className="mt-2 text-[#829069]">
            {modoRegistro
              ? 'Registrate para comenzar a comprar.'
              : 'Iniciá sesión para realizar tus compras.'}
          </p>

        </div>

        {!modoRegistro && location.state?.registrado === true && (
          <p className="mb-5 rounded-xl bg-[#EAF1CF] p-3 text-sm text-[#4B5C29]">
            Cuenta creada correctamente. Ya podés iniciar sesión.
          </p>
        )}

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value.trim()
                  ? 'Ingresá un nombre de usuario'
                  : undefined,
            }}
          >
            {(field) => (
              <div>

                <label
                  htmlFor={field.name}
                  className={estiloLabel}
                >
                  Nombre de usuario
                </label>

                <input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  className={estiloInput}
                  required
                  autoComplete="username"
                  placeholder="Tu usuario"
                />

                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}

              </div>
            )}
          </form.Field>

          {modoRegistro && (
            <>

              <form.Field
                name="full_name"
                validators={{
                  onChange: ({ value }) =>
                    !value.trim()
                      ? 'Ingresá tu nombre completo'
                      : undefined,
                }}
              >
                {(field) => (
                  <div>

                    <label
                      htmlFor={field.name}
                      className={estiloLabel}
                    >
                      Nombre completo
                    </label>

                    <input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value)
                      }
                      className={estiloInput}
                      required
                      autoComplete="name"
                      placeholder="Nombre y apellido"
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
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                      ? 'Ingresá un correo electrónico válido'
                      : undefined,
                }}
              >
                {(field) => (
                  <div>

                    <label
                      htmlFor={field.name}
                      className={estiloLabel}
                    >
                      Correo electrónico
                    </label>

                    <input
                      id={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value)
                      }
                      className={estiloInput}
                      required
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                    />

                    {field.state.meta.errors.map((error, i) => (
                      <p key={i} className="text-sm text-red-600">
                        {error}
                      </p>
                    ))}

                  </div>
                )}
              </form.Field>

            </>
          )}

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) {
                  return 'Ingresá tu contraseña'
                }

                if (modoRegistro && value.length < 8) {
                  return 'Debe tener al menos 8 caracteres'
                }

                return undefined
              },
            }}
          >
            {(field) => (
              <div>

                <label
                  htmlFor={field.name}
                  className={estiloLabel}
                >
                  Contraseña
                </label>

                <input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                  className={estiloInput}
                  required
                  minLength={modoRegistro ? 8 : undefined}
                  autoComplete={
                    modoRegistro
                      ? 'new-password'
                      : 'current-password'
                  }
                  placeholder="Ingresá tu contraseña"
                />

                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}

              </div>
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
                  !canSubmit || isSubmitting || cargando
                }
                className="w-full rounded-xl bg-[#788B50] px-5 py-3 font-semibold text-white transition hover:bg-[#4B5C29] disabled:opacity-50"
              >
                {cargando || isSubmitting
                  ? 'Procesando...'
                  : modoRegistro
                    ? 'Registrarme'
                    : 'Iniciar sesión'}
              </button>
            )}
          </form.Subscribe>

        </form>

        <div className="mt-6 text-center">

          <Link
            to={modoRegistro ? '/login' : '/register'}
            onClick={() => form.reset()}
            className="font-semibold text-[#4B5C29] underline"
          >
            {modoRegistro
              ? '¿Ya tenés cuenta? Iniciá sesión'
              : '¿No tenés cuenta? Registrate'}
          </Link>

        </div>

      </div>
    </div>
  )
}