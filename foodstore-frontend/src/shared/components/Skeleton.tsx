interface SkeletonProps {
  cantidad?: number
  className?: string
  contenedorClassName?: string
  mensaje?: string
}

export default function Skeleton({
  cantidad = 1,
  className = 'h-96',
  contenedorClassName = 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
  mensaje = 'Cargando...',
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={mensaje}
      className={contenedorClassName}
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl bg-gray-200 ${className}`}
        />
      ))}
    </div>
  )
}