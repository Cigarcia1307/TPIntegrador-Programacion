
function Footer() {
  return (
    <footer className="bg-[#4B5C29] px-6 py-3 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">

        <div className="flex items-center gap-3">
          <span
            className="text-xl font-semibold text-[#FEF6BB]"
            style={{
              fontFamily: '"Bodoni Moda", Georgia, serif',
              fontStyle: 'normal',
            }}
          >
            FoodStore
          </span>

          <span className="text-xs text-white/80">
            Gestión de productos
          </span>
        </div>

        <p className="text-xs text-[#FEF6BB]">
          © 2026 FoodStore · Sistema de administración
        </p>

      </div>
    </footer>
  )
}

export default Footer
