interface PaginacionProps {
  pagina: number
  total: number
  limite: number
  cargando?: boolean
  onChange: (pagina: number) => void
}

export default function Paginacion({
  pagina,
  total,
  limite,
  cargando = false,
  onChange,
}: PaginacionProps) {
  const totalPaginas = Math.ceil(total / limite)

  if (totalPaginas <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 0 || cargando}
        className="rounded-xl bg-white px-5 py-2 font-semibold text-[#4B5C29] disabled:opacity-40"
      >
        Anterior
      </button>

      <span className="font-semibold text-[#4B5C29]">
        Página {pagina + 1} de {totalPaginas}
      </span>

      <button
        type="button"
        onClick={() => onChange(pagina + 1)}
        disabled={pagina + 1 >= totalPaginas || cargando}
        className="rounded-xl bg-white px-5 py-2 font-semibold text-[#4B5C29] disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  )
}