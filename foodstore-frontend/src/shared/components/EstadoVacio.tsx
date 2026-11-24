import Card from '../ui/Card'

interface EstadoVacioProps {
  titulo: string
  mensaje?: string
}

export default function EstadoVacio({
  titulo,
  mensaje,
}: EstadoVacioProps) {
  return (
    <Card className="p-10 text-center">
      <h3 className="text-xl font-bold text-[#4B5C29]">
        {titulo}
      </h3>

      {mensaje && (
        <p className="mt-2 text-[#829069]">
          {mensaje}
        </p>
      )}
    </Card>
  )
}