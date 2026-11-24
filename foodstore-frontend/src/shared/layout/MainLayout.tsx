import type { ReactNode } from 'react'

import Navbar from './Navbar'
import Footer from './Footer'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6EC]">

      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>

      <Footer />

    </div>
  )
}