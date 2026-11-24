import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../types'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock_disponible: number
}

interface CarritoState {
  items: ItemCarrito[]

  agregarProducto: (producto: Producto) => void
  quitarProducto: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciarCarrito: () => void
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set) => ({
      items: [],

      agregarProducto: (producto) => {
        if (
          !producto.activo ||
          !producto.disponible ||
          producto.stock <= 0
        ) {
          return
        }

        set((estado) => {
          const existente = estado.items.find(
            (item) => item.producto_id === producto.id
          )

          const stock = producto.stock

          if (existente) {
            return {
              items: estado.items.map((item) =>
                item.producto_id === producto.id
                  ? {
                      ...item,
                      precio_unitario: producto.precio_base,
                      stock_disponible: stock,
                      cantidad: Math.min(item.cantidad + 1, stock),
                    }
                  : item
              ),
            }
          }

          return {
            items: [
              ...estado.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: 1,
                stock_disponible: stock,
              },
            ],
          }
        })
      },

      quitarProducto: (productoId) => {
        set((estado) => ({
          items: estado.items.filter(
            (item) => item.producto_id !== productoId
          ),
        }))
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (!Number.isFinite(cantidad)) return

        set((estado) => ({
          items: estado.items.map((item) =>
            item.producto_id === productoId
              ? {
                  ...item,
                  cantidad: Math.max(
                    1,
                    Math.min(
                      Math.floor(cantidad),
                      item.stock_disponible
                    )
                  ),
                }
              : item
          ),
        }))
      },

      vaciarCarrito: () => set({ items: [] }),
    }),
    {
      name: 'foodstore-carrito',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)

export const calcularTotalCarrito = (items: ItemCarrito[]): number =>
  items.reduce(
    (total, item) => total + item.precio_unitario * item.cantidad,
    0
  )

export const calcularCantidadCarrito = (items: ItemCarrito[]): number =>
  items.reduce((total, item) => total + item.cantidad, 0)