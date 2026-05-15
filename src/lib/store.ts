import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./products";

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      isCartOpen: false,

      addItem: (product, size) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.size === size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, size, quantity: 1 }] };
        });
        set({ isCartOpen: true });
      },

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        })),

      updateQty: (productId, size, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter(
                  (i) => !(i.product.id === productId && i.size === size)
                )
              : state.items.map((i) =>
                  i.product.id === productId && i.size === size
                    ? { ...i, quantity: qty }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      total: () =>
        get().items.reduce(
          (sum, i) => sum + (i.product.offer_price || i.product.price) * i.quantity,
          0
        ),

      count: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "bestchappals-cart" }
  )
);
