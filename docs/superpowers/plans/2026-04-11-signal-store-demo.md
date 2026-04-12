# SignalStore Shop Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a SignalStore demo page with a progressive shop example showing `withState`, `withComputed`, and `withMethods` — each section pairing a code snippet with live UI.

**Architecture:** A single NgRx SignalStore (`CartStore`) holds shop item state. One component renders three sections that progressively explain the store features. The store is `providedIn: 'root'` and the component is lazy-loaded at `/signal-store`.

**Tech Stack:** Angular 21, @ngrx/signals, DaisyUI, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-11-signal-store-demo-design.md`

---

## File Structure

| Action  | Path                                                      | Responsibility                            |
| ------- | --------------------------------------------------------- | ----------------------------------------- |
| Install | `@ngrx/signals` (npm)                                     | NgRx SignalStore library                  |
| Create  | `src/app/features/signal-store/cart.store.ts`             | SignalStore with state, computed, methods |
| Create  | `src/app/features/signal-store/signal-store.component.ts` | Progressive demo component                |
| Modify  | `src/app/app.routes.ts`                                   | Add `/signal-store` lazy route            |
| Modify  | `src/app/layout/navbar.component.ts`                      | Add "SignalStore" nav link                |

---

### Task 1: Install @ngrx/signals

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
cd C:/Users/pst/demo && npm install @ngrx/signals
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @ngrx/signals
```

Expected: Shows `@ngrx/signals@21.x.x` (or latest compatible version)

---

### Task 2: Create the CartStore

**Files:**

- Create: `src/app/features/signal-store/cart.store.ts`

- [ ] **Step 1: Create the store file**

```typescript
import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

export type ShopItem = {
  id: number;
  name: string;
  price: number;
  inCart: boolean;
};

const initialItems: ShopItem[] = [
  { id: 1, name: 'Wireless Headphones', price: 59.99, inCart: false },
  { id: 2, name: 'Mechanical Keyboard', price: 89.99, inCart: false },
  { id: 3, name: 'USB-C Hub', price: 34.99, inCart: false },
  { id: 4, name: 'Monitor Stand', price: 44.99, inCart: false },
  { id: 5, name: 'Desk Lamp', price: 29.99, inCart: false },
];

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ items: initialItems }),
  withComputed(({ items }) => ({
    cartItems: computed(() => items().filter((item) => item.inCart)),
    cartTotal: computed(() =>
      items()
        .filter((item) => item.inCart)
        .reduce((sum, item) => sum + item.price, 0),
    ),
  })),
  withMethods((store) => ({
    toggleInCart(itemId: number) {
      patchState(store, {
        items: store
          .items()
          .map((item) => (item.id === itemId ? { ...item, inCart: !item.inCart } : item)),
      });
    },
  })),
);
```

---

### Task 3: Create the SignalStore demo component

**Files:**

- Create: `src/app/features/signal-store/signal-store.component.ts`

- [ ] **Step 1: Create the component file**

The component has three progressive sections. Each section has a two-column layout: code snippet on the left, live UI on the right. The code snippets use `<pre><code>` blocks styled with DaisyUI's `mockup-code` class.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartStore } from './shop.store';

@Component({
  selector: 'app-signal-store-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <div class="max-w-6xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">NgRx SignalStore</h1>
      <p class="text-lg opacity-70">
        A progressive walkthrough: define state, derive computed values, and update with methods.
      </p>

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
                @for (item of store.items(); track item.id) {
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
            Section 2 update reactively.
          </p>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="mockup-code text-sm">
              <pre><code>{{ withMethodsCode }}</code></pre>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Live: Toggle Cart</h3>
              <ul class="space-y-2">
                @for (item of store.items(); track item.id) {
                  <li class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <div>
                      <span>{{ item.name }}</span>
                      <span class="text-sm opacity-60 ml-2">{{ item.price | currency }}</span>
                    </div>
                    <button
                      class="btn btn-sm"
                      [class.btn-accent]="!item.inCart"
                      [class.btn-error]="item.inCart"
                      (click)="store.toggleInCart(item.id)"
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
    </div>
  `,
})
export class SignalStoreComponent {
  readonly store = inject(CartStore);

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
    items().filter(item => item.inCart)
  ),
  cartTotal: computed(() =>
    items()
      .filter(item => item.inCart)
      .reduce((sum, item) => sum + item.price, 0)
  ),
}))`;

  readonly withMethodsCode = `withMethods((store) => ({
  toggleInCart(itemId: number) {
    patchState(store, {
      items: store.items().map(item =>
        item.id === itemId
          ? { ...item, inCart: !item.inCart }
          : item
      ),
    });
  },
}))`;
}
```

---

### Task 4: Add route and navigation

**Files:**

- Modify: `src/app/app.routes.ts`
- Modify: `src/app/layout/navbar.component.ts`

- [ ] **Step 1: Add the lazy-loaded route**

In `src/app/app.routes.ts`, add a new route entry after the existing `signals` route:

```typescript
{
  path: 'signal-store',
  loadComponent: () =>
    import('./features/signal-store/signal-store.component').then((m) => m.SignalStoreComponent),
},
```

- [ ] **Step 2: Add nav link to navbar**

In `src/app/layout/navbar.component.ts`, add a "SignalStore" link in both the mobile dropdown `<ul>` and the desktop `<ul>`:

```html
<li><a routerLink="/signal-store" routerLinkActive="active">SignalStore</a></li>
```

Add it after the existing "Signal Forms" link in both locations.

---

### Task 5: Verify the demo works

- [ ] **Step 1: Start the dev server**

```bash
cd C:/Users/pst/demo && npm start
```

- [ ] **Step 2: Manual verification checklist**

1. Navigate to `http://localhost:4201/signal-store`
2. Section 1: All 5 products visible with names and prices
3. Section 2: Shows "Cart is empty" message
4. Section 3: Click "Add to Cart" on a product → button changes to "Remove"
5. Section 2: Cart summary updates with item count and total
6. Click "Remove" → item removed from cart, total updates
7. All three code snippet blocks are visible and readable
8. Navbar shows "SignalStore" link and it's highlighted when active
