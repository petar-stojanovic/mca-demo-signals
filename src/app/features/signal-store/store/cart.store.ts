// src/app/features/signal-store/cart.store.ts
import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { withLogger } from './signal-store-features';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  inCart: boolean;
};

export type AppState = {
  cartItems: CartItem[];
  searchQuery: string;
};

export const initialState: AppState = {
  cartItems: [
    { id: 1, name: 'Wireless Headphones', price: 59.99, inCart: false },
    { id: 2, name: 'Mechanical Keyboard', price: 89.99, inCart: false },
    { id: 3, name: 'USB-C Hub', price: 34.99, inCart: false },
    { id: 4, name: 'Monitor Stand', price: 44.99, inCart: false },
    { id: 5, name: 'Desk Lamp', price: 29.99, inCart: false },
  ],
  searchQuery: '',
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withDevtools('[CART-STORE]'),
  withState(initialState),
  withLogger('[CART-STORE]'),
  withComputed(({ cartItems, searchQuery }) => ({
    cartOnlyItems: computed(() => cartItems().filter((item) => item.inCart)),
    cartTotal: computed(() =>
      cartItems()
        .filter((item) => item.inCart)
        .reduce((sum, item) => sum + item.price, 0),
    ),
    filteredItems: computed(() =>
      cartItems().filter((item) => item.name.toLowerCase().includes(searchQuery().toLowerCase())),
    ),
  })),
  withMethods((store) => ({
    toggleInCart(itemId: number) {
      patchState(store, (state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === itemId ? { ...item, inCart: !item.inCart } : item,
        ),
      }));
    },
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },
  })),
  withHooks({
    onInit: (store) => console.log('Store initialized', store),
    onDestroy: (store) => console.log('Store destroyed', store),
  }),
);
