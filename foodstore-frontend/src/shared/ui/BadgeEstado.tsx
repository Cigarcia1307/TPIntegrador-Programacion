import type { EstadoPedido } from '../../types'

interface BadgeEstadoProps {
  estado: EstadoPedido
  className?: string
}

const coloresEstado: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export default function BadgeEstado({
  estado,
  className = 'px-4 py-2 text-sm',
}: BadgeEstadoProps) {
  return (
    <span
      className={`rounded-full font-semibold ${coloresEstado[estado]} ${className}`}
    >
      {estado.replaceAll('_', ' ')}
    </span>
  )
}