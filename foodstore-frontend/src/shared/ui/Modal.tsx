import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

export default function Modal({
  titulo,
  onCerrar,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#4B5C29]">
            {titulo}
          </h2>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-[#EAF1CF] px-4 py-2 font-semibold text-[#4B5C29]"
          >
            Cerrar
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}