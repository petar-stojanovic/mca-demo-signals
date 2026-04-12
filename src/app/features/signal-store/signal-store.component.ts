import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { injectDispatch } from '@ngrx/signals/events';
import { CartItem, CartStore } from './cart.store';
import { cartEvents } from './cart.events';

@Component({
  selector: 'app-signal-store-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <div class="max-w-8xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">NgRx SignalStore</h1>
      <p class="text-lg opacity-70">
        A progressive walkthrough: define state, derive computed values, and update with methods.
      </p>

      <!-- Intro: Why SignalStore? -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">Why SignalStore?</h2>
          <p class="opacity-70 mb-4">
            Classic NgRx is powerful but requires a lot of boilerplate: Actions, Reducers,
            Selectors, Effects — all in separate files. SignalStore replaces all of that with a
            single, functional API built on Angular Signals.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="p-4 bg-base-200 rounded-lg">
              <h3 class="font-bold mb-1">Less Boilerplate</h3>
              <p class="text-sm opacity-70">
                No actions, no reducers, no selectors. One file instead of four.
              </p>
            </div>
            <div class="p-4 bg-base-200 rounded-lg">
              <h3 class="font-bold mb-1">Signal-Native</h3>
              <p class="text-sm opacity-70">Built on Angular Signals</p>
            </div>
            <div class="p-4 bg-base-200 rounded-lg">
              <h3 class="font-bold mb-1">Functional & Composable</h3>
              <p class="text-sm opacity-70">
                Compose features with <code>withState</code>, <code>withComputed</code>,
                <code>withMethods</code>. Extend with custom features.
              </p>
            </div>
          </div>

          <h3 class="font-semibold text-lg mb-3">Classic NgRx vs SignalStore</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div class="badge badge-error badge-outline mb-2">Classic NgRx — 4 files</div>
              <div class="mockup-code text-sm">
                <pre><code>{{ classicNgrxCode }}</code></pre>
              </div>
            </div>
            <div>
              <div class="badge badge-success badge-outline mb-2">SignalStore — 1 file</div>
              <div class="mockup-code text-sm">
                <pre><code>{{ signalStoreComparisonCode }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 1: withState -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-primary badge-lg">1</span>
            Define State with
            <code class="text-primary">withState</code>
          </h2>
          <p class="opacity-70 mb-4">
            The store starts with an initial state object. Each property becomes a signal
            automatically.
          </p>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="mockup-code text-sm">
              <pre><code>{{ withStateCode }}</code></pre>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Live: Product List</h3>
              <ul class="space-y-2">
                @for (item of store.cartItems(); track item.id) {
                  <li class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <span>{{ item.name }}</span>
                    <span class="badge badge-outline">{{ item.price | currency }}</span>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: withComputed -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-secondary badge-lg">2</span>
            Derive State with
            <code class="text-secondary">withComputed</code>
          </h2>
          <p class="opacity-70 mb-4">
            Computed signals derive values from state. They update automatically when the source
            changes.
          </p>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="mockup-code text-sm">
              <pre><code>{{ withComputedCode }}</code></pre>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Live: Cart Summary</h3>
              @if (store.cartItems().length === 0) {
                <div class="alert">
                  <span>Cart is empty. Add items in Section 3 below.</span>
                </div>
              } @else {
                <div class="stats shadow w-full">
                  <div class="stat">
                    <div class="stat-title">Items in Cart</div>
                    <div class="stat-value text-secondary">{{ store.cartItems().length }}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Total</div>
                    <div class="stat-value text-secondary">{{ store.cartTotal() | currency }}</div>
                  </div>
                </div>
                <ul class="mt-4 space-y-1">
                  @for (item of store.cartItems(); track item.id) {
                    <li class="flex justify-between p-2 bg-base-200 rounded">
                      <span>{{ item.name }}</span>
                      <span>{{ item.price | currency }}</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: withMethods -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-accent badge-lg">3</span>
            Update State with
            <code class="text-accent">withMethods</code>
          </h2>
          <p class="opacity-70 mb-4">
            Methods use <code>patchState</code> for immutable updates. Click the buttons — watch
            Section 2 update reactively and the notification bell in the navbar light up.
          </p>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="mockup-code text-sm">
              <pre><code>{{ withMethodsCode }}</code></pre>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Live: Toggle Cart</h3>
              <ul class="space-y-2">
                @for (item of store.cartItems(); track item.id) {
                  <li class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <div>
                      <span>{{ item.name }}</span>
                      <span class="text-sm opacity-60 ml-2">{{ item.price | currency }}</span>
                    </div>
                    <button
                      class="btn btn-sm"
                      [class.btn-accent]="!item.inCart"
                      [class.btn-error]="item.inCart"
                      (click)="toggleItem(item)"
                    >
                      {{ item.inCart ? 'Remove' : 'Add to Cart' }}
                    </button>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Events — Store Communication -->
      <section class="card bg-base-100 shadow-xl border-2 border-info">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-info badge-lg">4</span>
            Store Communication with
            <code class="text-info">Events</code>
          </h2>
          <p class="opacity-70 mb-4">
            Events decouple <em>what happened</em> from <em>how state changes</em>. The buttons in
            Section 3 also dispatch events. A completely separate
            <code>NotificationStore</code> reacts to them — check the bell icon in the navbar.
          </p>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div class="badge badge-info badge-outline mb-2">1. Define Events</div>
              <div class="mockup-code text-sm">
                <pre><code>{{ eventGroupCode }}</code></pre>
              </div>
            </div>
            <div>
              <div class="badge badge-info badge-outline mb-2">2. Dispatch from Component</div>
              <div class="mockup-code text-sm">
                <pre><code>{{ injectDispatchCode }}</code></pre>
              </div>
            </div>
            <div>
              <div class="badge badge-warning badge-outline mb-2">
                3. NotificationStore reacts via withReducer
              </div>
              <div class="mockup-code text-sm">
                <pre><code>{{ withReducerCode }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f4f4f4;
      color: #c7254e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 1rem;
      line-height: 1.4;
    }
    pre code {
      display: block;
      padding: 1rem;
      background-color: #2d2d2d;
      color: #f8f8f2;
      overflow-x: auto;
      border-radius: 6px;
    }
  `,
})
export class SignalStoreComponent {
  readonly store = inject(CartStore);
  readonly dispatch = injectDispatch(cartEvents);

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
    if (item.inCart) {
      this.dispatch.itemRemoved({ name: item.name });
    } else {
      this.dispatch.itemAdded({ name: item.name, price: item.price });
    }
  }

  readonly classicNgrxCode = `// actions.ts
export const loadItems = createAction('[Cart] Load');
export const toggleCart = createAction(
  '[Cart] Toggle', props<{ itemId: number }>()
);

// reducer.ts
export const cartReducer = createReducer(
  initialState,
  on(loadItems, (state) => ({ ...state, items })),
  on(toggleCart, (state, { itemId }) => ({
    ...state,
    items: state.items.map(item =>
      item.id === itemId
        ? { ...item, inCart: !item.inCart }
        : item
    ),
  }))
);

// selectors.ts
export const selectItems = createSelector(
  selectcartState, (state) => state.items
);
export const selectCartItems = createSelector(
  selectItems, (items) => items.filter(i => i.inCart)
);
export const selectCartTotal = createSelector(
  selectCartItems, (items) =>
    items.reduce((sum, i) => sum + i.price, 0)
);`;

  readonly signalStoreComparisonCode = `// cart.store.ts — that's it!
export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ cartItems: initialItems }),
  withComputed(({ cartItems }) => ({
    cartItems: computed(() =>
      cartItems().filter(i => i.inCart)),
    cartTotal: computed(() =>
      cartItems().filter(i => i.inCart)
        .reduce((sum, i) => sum + i.price, 0)),
  })),
  withMethods((store) => ({
    toggleInCart(itemId: number) {
      patchState(store, {
        items: store.cartItems().map(item =>
          item.id === itemId
            ? { ...item, inCart: !item.inCart }
            : item),
      });
    },
  })),
);`;

  readonly withStateCode = `const CartStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [
      { id: 1, name: 'Wireless Headphones', price: 59.99, inCart: false },
      { id: 2, name: 'Mechanical Keyboard', price: 89.99, inCart: false },
      // ...
    ]
  })
);`;

  readonly withComputedCode = `withComputed(({ items }) => ({
  cartItems: computed(() =>
    cartItems().filter(item => item.inCart)
  ),
  cartTotal: computed(() =>
    cartItems()
      .filter(item => item.inCart)
      .reduce((sum, item) => sum + item.price, 0)
  ),
}))`;

  readonly withMethodsCode = `withMethods((store) => ({
  toggleInCart(itemId: number) {
    patchState(store, {
      items: store.cartItems().map(item =>
        item.id === itemId
          ? { ...item, inCart: !item.inCart }
          : item
      ),
    });
  },
}))`;

  readonly eventGroupCode = `// cart.events.ts
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const cartEvents = eventGroup({
  source: 'Cart',
  events: {
    itemAdded: type<{ name: string; price: number }>(),
    itemRemoved: type<{ name: string }>(),
    cartCleared: type<void>(),
  },
});`;

  readonly injectDispatchCode = `// component
import { injectDispatch } from '@ngrx/signals/events';
import { cartEvents } from './cart.events';

class MyComponent {
  dispatch = injectDispatch(cartEvents);

  addItem(name: string, price: number) {
    this.dispatch.itemAdded({ name, price });
  }
}`;

  readonly withReducerCode = `// notification.store.ts — separate store!
import { on, withReducer } from '@ngrx/signals/events';
import { cartEvents } from './cart.events';

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState({ notifications: [] }),
  withReducer(
    on(cartEvents.itemAdded, ({ payload }, state) => ({
      notifications: [...state.notifications, {
        message: \`Added "\${payload.name}"\`,
      }],
    })),
    on(cartEvents.itemRemoved, ({ payload }, state) => ({
      notifications: [...state.notifications, {
        message: \`Removed "\${payload.name}"\`,
      }],
    })),
  ),
);`;
}
