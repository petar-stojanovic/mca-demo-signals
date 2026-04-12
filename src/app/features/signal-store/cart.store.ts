import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';

export type ShopItem = {
  id: number;
  name: string;
  price: number;
  inCart: boolean;
};

export type AppState = {
  cartItems: ShopItem[];
};

export const initialState: AppState = {
  cartItems: [
    { id: 1, name: 'Wireless Headphones', price: 59.99, inCart: false },
    { id: 2, name: 'Mechanical Keyboard', price: 89.99, inCart: false },
    { id: 3, name: 'USB-C Hub', price: 34.99, inCart: false },
    { id: 4, name: 'Monitor Stand', price: 44.99, inCart: false },
    { id: 5, name: 'Desk Lamp', price: 29.99, inCart: false },
  ],
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withDevtools('[CART-STORE]'),
  // withLogger('[CART-STORE]'),
  withState(initialState),
  withComputed(({ cartItems }) => ({
    cartItems: computed(() => cartItems().filter((item) => item.inCart)),
    cartTotal: computed(() =>
      cartItems()
        .filter((item) => item.inCart)
        .reduce((sum, item) => sum + item.price, 0),
    ),
  })),
  withMethods((store) => ({
    toggleInCart(itemId: number) {
      patchState(store, {
        cartItems: store
          .cartItems()
          .map((item) => (item.id === itemId ? { ...item, inCart: !item.inCart } : item)),
      });
    },
  })),
);
