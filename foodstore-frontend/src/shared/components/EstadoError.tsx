interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export default function EstadoError({
  mensaje,
  onReintentar,
}: EstadoErrorProps) {
  return (
    <div className="rounded-2xl bg-red-50 p-6 text-red-700">
      <p role="alert">{mensaje}</p>

      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-4 rounded-xl bg-[#788B50] px-5 py-2 text-white"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}