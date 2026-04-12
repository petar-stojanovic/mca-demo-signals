# Signals Demo App Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the presentation app — merge the Zoneless page into Signals, remove all inline code snippets, and split SignalStore content into four focused pages: SignalStore core, Events, Testing, and Custom Features.

**Architecture:** 5 standalone Angular pages connected by lazy-loaded routes. Each page has one thesis. All `mockup-code` blocks and code string properties are removed. Two new pages added (`/events`, `/testing`). `/zoneless` is deleted and its logic merged into `/signals`. A CartStore bug (computed shadows state signal) is fixed as part of Task 1 so all product list demos work correctly.

**Tech Stack:** Angular 20+, NgRx SignalStore (`@ngrx/signals`), NgRx Signals Events (`@ngrx/signals/events`), DaisyUI, Tailwind CSS

---

## File Map

| Action | File                                                            |
| ------ | --------------------------------------------------------------- |
| Modify | `src/app/features/signal-store/cart.store.ts`                   |
| Modify | `src/app/app.routes.ts`                                         |
| Modify | `src/app/layout/navbar.component.ts`                            |
| Modify | `src/app/features/signals/signals.component.ts`                 |
| Modify | `src/app/features/signals/signals.component.html`               |
| Delete | `src/app/features/zoneless/zoneless.component.ts`               |
| Delete | `src/app/features/zoneless/zoneless.component.html`             |
| Modify | `src/app/features/signal-store/signal-store.component.ts`       |
| Create | `src/app/features/events/events.component.ts`                   |
| Create | `src/app/features/testing/testing.component.ts`                 |
| Modify | `src/app/features/custom-features/custom-features.component.ts` |

---

### Task 1: Fix CartStore — expose all items and fix toggleInCart

**Why:** The current `withComputed` creates a `cartItems` computed that shadows the state signal of the same name. `store.cartItems()` only returns in-cart items, so the product list and toggle buttons start empty. Fix: rename the computed to `cartOnlyItems` (the raw state `cartItems` becomes directly accessible), and fix `toggleInCart` to use `patchState`'s state-callback form so it always operates on the full list.

**Files:**

- Modify: `src/app/features/signal-store/cart.store.ts`

- [ ] **Step 1: Replace cart.store.ts**

```ts
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

export type CartItem = {
  id: number;
  name: string;
  price: number;
  inCart: boolean;
};

export type AppState = {
  cartItems: CartItem[];
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
  withState(initialState),
  withComputed(({ cartItems }) => ({
    cartOnlyItems: computed(() => cartItems().filter((item) => item.inCart)),
    cartTotal: computed(() =>
      cartItems()
        .filter((item) => item.inCart)
        .reduce((sum, item) => sum + item.price, 0),
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
  })),
  withHooks({
    onInit: (store) => console.log('Store initialized', store),
    onDestroy: (store) => console.log('Store destroyed', store),
  }),
);
```

- [ ] **Step 2: Verify the app compiles**

Run: `ng serve`
Expected: no compilation errors. The existing `/signal-store` page will have broken template bindings until Task 5 — that is fine at this stage.

---

### Task 2: Update app.routes.ts

**Files:**

- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Replace app.routes.ts**

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'signals', pathMatch: 'full' },
  {
    path: 'signals',
    loadComponent: () =>
      import('./features/signals/signals.component').then((m) => m.SignalsDemoComponent),
  },
  {
    path: 'signal-store',
    loadComponent: () =>
      import('./features/signal-store/signal-store.component').then((m) => m.SignalStoreComponent),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'testing',
    loadComponent: () =>
      import('./features/testing/testing.component').then((m) => m.TestingComponent),
  },
  {
    path: 'custom-features',
    loadComponent: () =>
      import('./features/custom-features/custom-features.component').then(
        (m) => m.CustomFeaturesComponent,
      ),
  },
];
```

- [ ] **Step 2: Verify**

Run: `ng serve`
Expected: app loads, `/signals` is the home page. `/events` and `/testing` will 404 until Tasks 6–7 — that is expected.

---

### Task 3: Update NavbarComponent

**Files:**

- Modify: `src/app/layout/navbar.component.ts`

- [ ] **Step 1: Replace navbar.component.ts**

```ts
// src/app/layout/navbar.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { injectDispatch } from '@ngrx/signals/events';
import { NotificationStore } from '../features/signal-store/notification.store';
import { cartEvents } from '../features/signal-store/cart.events';

const NAV_ITEMS = [
  { label: 'Signals & Zoneless', path: '/signals' },
  { label: 'SignalStore', path: '/signal-store' },
  { label: 'Events', path: '/events' },
  { label: 'Testing', path: '/testing' },
  { label: 'Custom Features', path: '/custom-features' },
] as const;

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="navbar bg-base-100 shadow-lg fixed top-0 z-50">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            @for (item of navItems; track item.path) {
              <li>
                <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
              </li>
            }
          </ul>
        </div>
        <a routerLink="/" class="btn btn-ghost text-xl">Angular Signals</a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          @for (item of navItems; track item.path) {
            <li>
              <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
            </li>
          }
        </ul>
      </div>
      <div class="navbar-end">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <div class="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              @if (notificationStore.notifications().length > 0) {
                <span class="badge badge-xs badge-info indicator-item">
                  {{ notificationStore.notifications().length }}
                </span>
              }
            </div>
          </div>
          <div
            tabindex="0"
            class="dropdown-content mt-3 z-[1] card card-compact w-80 shadow-lg bg-base-100"
          >
            <div class="card-body">
              <div class="flex items-center justify-between">
                <h3 class="card-title text-sm">Events Log</h3>
                @if (notificationStore.notifications().length > 0) {
                  <button
                    class="btn btn-ghost btn-xs"
                    (click)="clearNotifications()"
                    aria-label="Clear all notifications"
                  >
                    Clear all
                  </button>
                }
              </div>
              @if (notificationStore.notifications().length === 0) {
                <p class="text-sm opacity-50">No events yet.</p>
              } @else {
                <ul class="space-y-1 max-h-64 overflow-y-auto">
                  @for (notification of notificationStore.notifications(); track notification.id) {
                    <li class="text-sm p-2 bg-base-200 rounded flex justify-between">
                      <span>{{ notification.message }}</span>
                      <span class="opacity-50 text-xs">{{ notification.timestamp }}</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NavbarComponent {
  readonly navItems = NAV_ITEMS;
  readonly notificationStore = inject(NotificationStore);
  private readonly dispatch = injectDispatch(cartEvents);

  clearNotifications() {
    this.dispatch.cartCleared();
  }
}
```

- [ ] **Step 2: Verify**

Run: `ng serve`
Expected: navbar shows 5 items — Signals & Zoneless, SignalStore, Events, Testing, Custom Features. Notification bell still works.

---

### Task 4: Merge ZonelessDemoComponent into SignalsDemoComponent

**Files:**

- Modify: `src/app/features/signals/signals.component.ts`
- Modify: `src/app/features/signals/signals.component.html`
- Delete: `src/app/features/zoneless/zoneless.component.ts`
- Delete: `src/app/features/zoneless/zoneless.component.html`

- [ ] **Step 1: Replace signals.component.ts**

```ts
// src/app/features/signals/signals.component.ts
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  // Sync counter — zone counter won't update without Zone.js
  counter = 0;
  get doubleCounter() {
    console.log('Zone Check: Calculating doubleCounter');
    return this.counter * 2;
  }
  signalCounter = signal(0);
  signalDoubleCounter = computed(() => {
    console.log('Signal Check: Calculating signalDoubleCounter');
    return this.signalCounter() * 2;
  });

  incrementZone() {
    this.counter++;
  }
  incrementSignal() {
    this.signalCounter.update((c) => c + 1);
  }

  // Async demo — plain property fails after setTimeout, signal works
  traditionalValue = 0;
  signalValue = signal(0);

  updateTraditional() {
    setTimeout(() => {
      this.traditionalValue++;
    }, 1000);
  }
  updateSignal() {
    setTimeout(() => {
      this.signalValue.update((v) => v + 1);
    }, 1000);
  }
  forceCheck() {
    this.cdr.detectChanges();
  }
}
```

- [ ] **Step 2: Add the async demo section to the end of signals.component.html**

Open `src/app/features/signals/signals.component.html`. The file ends with `</div>` closing the root `<div class="space-y-12 py-4">`. Add the following section **before** that closing `</div>`:

```html
<!-- Act 2: Async updates -->
<section class="min-h-screen flex items-center justify-center">
  <div class="card w-full max-w-2xl">
    <h2 class="card-title text-2xl mb-1">Async Updates</h2>
    <p class="text-sm opacity-60 mb-6">
      Both buttons wait <strong>1 second</strong> before updating. No Zone.js means plain properties
      are invisible to Angular — only signals can notify it.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Plain property -->
      <div class="p-4 border border-error rounded-lg bg-base-200">
        <h3 class="text-xl font-bold mb-2 text-error">Plain Property</h3>
        <div class="stats shadow w-full">
          <div class="stat">
            <div class="stat-title">Value</div>
            <div class="stat-value text-error">{{ traditionalValue }}</div>
          </div>
        </div>
        <button class="btn btn-error mt-4 text-white" (click)="updateTraditional()">
          Update (1s delay)
        </button>
        <p class="mt-2 text-xs opacity-60">UI freezes — no Zone.js, no signal.</p>
      </div>
      <!-- Signal -->
      <div class="p-4 border-2 border-success rounded-lg bg-base-200">
        <h3 class="text-xl font-bold mb-2 text-success">Signal</h3>
        <div class="stats shadow w-full">
          <div class="stat">
            <div class="stat-title">Value</div>
            <div class="stat-value text-success">{{ signalValue() }}</div>
          </div>
        </div>
        <button class="btn btn-success mt-4 text-white" (click)="updateSignal()">
          Update (1s delay)
        </button>
        <p class="mt-2 text-xs opacity-60">Works — Angular tracks the signal.</p>
      </div>
    </div>
    <div class="mt-6">
      <button class="btn btn-outline btn-sm" (click)="forceCheck()">
        Force CDR Check — fixes the plain property
      </button>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Delete the zoneless component files**

```bash
rm src/app/features/zoneless/zoneless.component.ts
rm src/app/features/zoneless/zoneless.component.html
```

- [ ] **Step 4: Verify**

Run: `ng serve`
Open `/signals`. Scroll down — you should see: GIF cards, sync counter demo, then the async demo at the bottom. Click "Update (1s delay)" on both sides — plain property stays frozen, signal updates after 1 second. "Force CDR Check" fixes the plain property. `/zoneless` now 404s.

---

### Task 5: Rewrite SignalStoreComponent

Remove all code snippet strings and `mockup-code` blocks. Use `store.cartItems()` (raw state) for the full product list and `store.cartOnlyItems()` for in-cart items. Add an `rxMethod` concept section. Remove the Events section (moved to Task 6).

**Files:**

- Modify: `src/app/features/signal-store/signal-store.component.ts`

- [ ] **Step 1: Replace signal-store.component.ts**

```ts
// src/app/features/signal-store/signal-store.component.ts
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
      <p class="text-lg opacity-70">One file. One API. Everything in the store.</p>

      <!-- Why SignalStore -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">Why SignalStore?</h2>
          <p class="opacity-70 mb-4">
            Classic NgRx is powerful but requires a lot of ceremony. SignalStore replaces all of
            that with a single, functional API built on Angular Signals.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-error/10 border border-error/30 rounded-lg">
              <div class="badge badge-error badge-outline mb-3">Classic NgRx — 4 files</div>
              <ul class="text-sm space-y-1 opacity-70">
                <li>actions.ts</li>
                <li>reducer.ts</li>
                <li>selectors.ts</li>
                <li>effects.ts</li>
              </ul>
            </div>
            <div class="p-4 bg-success/10 border border-success/30 rounded-lg">
              <div class="badge badge-success badge-outline mb-3">SignalStore — 1 file</div>
              <ul class="text-sm space-y-1 opacity-70">
                <li>withState — define state</li>
                <li>withComputed — derive values</li>
                <li>withMethods — update state</li>
                <li>withHooks — lifecycle</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 1: withState -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-primary badge-lg">1</span>
            <code class="text-primary">withState</code>
          </h2>
          <p class="opacity-70 mb-4">
            Define your state shape. Each property becomes a signal automatically.
          </p>
          <h3 class="font-semibold mb-2">Live: All Products</h3>
          <ul class="space-y-2">
            @for (item of store.cartItems(); track item.id) {
              <li class="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <span>{{ item.name }}</span>
                <span class="badge badge-outline">{{ item.price | currency }}</span>
              </li>
            }
          </ul>
        </div>
      </section>

      <!-- Section 2: withComputed -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-secondary badge-lg">2</span>
            <code class="text-secondary">withComputed</code>
          </h2>
          <p class="opacity-70 mb-4">
            Derived values. Always in sync. Recalculate only when the source changes.
          </p>
          @if (store.cartOnlyItems().length === 0) {
            <div class="alert">
              <span>Cart is empty. Add items in Section 3 below.</span>
            </div>
          } @else {
            <div class="stats shadow w-full">
              <div class="stat">
                <div class="stat-title">Items in Cart</div>
                <div class="stat-value text-secondary">{{ store.cartOnlyItems().length }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Total</div>
                <div class="stat-value text-secondary">{{ store.cartTotal() | currency }}</div>
              </div>
            </div>
            <ul class="mt-4 space-y-1">
              @for (item of store.cartOnlyItems(); track item.id) {
                <li class="flex justify-between p-2 bg-base-200 rounded">
                  <span>{{ item.name }}</span>
                  <span>{{ item.price | currency }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </section>

      <!-- Section 3: withMethods -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-accent badge-lg">3</span>
            <code class="text-accent">withMethods</code>
          </h2>
          <p class="opacity-70 mb-4">
            All state changes go through the store. Components just call methods — watch Sections 1
            and 2 update reactively.
          </p>
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
      </section>

      <!-- Section 4: rxMethod -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-info badge-lg">4</span>
            <code class="text-info">rxMethod</code>
          </h2>
          <p class="opacity-70 mb-2">
            A built-in SignalStore tool — not something you write. Connects RxJS streams to your
            store.
          </p>
          <p class="opacity-70 mb-4">
            Accepts a static value, a signal, or an observable. No manual
            <code>.subscribe()</code>. Cleans up automatically when the store is destroyed.
          </p>
          <div class="flex flex-wrap gap-3 mb-4">
            <span class="badge badge-info badge-outline p-3">No <code>.subscribe()</code></span>
            <span class="badge badge-info badge-outline p-3">Reactive by default</span>
            <span class="badge badge-info badge-outline p-3">Auto-cleanup on destroy</span>
          </div>
          <div class="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>You will see <code>rxMethod</code> in action on the Custom Features page.</span>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SignalStoreComponent {
  readonly store = inject(CartStore);
  private readonly dispatch = injectDispatch(cartEvents);

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
    if (item.inCart) {
      this.dispatch.itemRemoved({ name: item.name });
    } else {
      this.dispatch.itemAdded({ name: item.name, price: item.price });
    }
  }
}
```

- [ ] **Step 2: Verify**

Run: `ng serve`
Open `/signal-store`. Verify:

- All 5 products appear in Sections 1 and 3
- Toggling items updates Section 2 (cart summary) reactively
- Notification bell lights up on toggle
- No code snippets visible anywhere on the page

---

### Task 6: Create EventsComponent

**Files:**

- Create: `src/app/features/events/events.component.ts`

- [ ] **Step 1: Create the events directory and component**

```ts
// src/app/features/events/events.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { injectDispatch } from '@ngrx/signals/events';
import { CartItem, CartStore } from '../signal-store/cart.store';
import { NotificationStore } from '../signal-store/notification.store';
import { cartEvents } from '../signal-store/cart.events';

@Component({
  selector: 'app-events-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <div class="max-w-8xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">Events</h1>
      <p class="text-lg opacity-70">
        Events decouple <em>what happened</em> from <em>how state changes</em>.
      </p>

      <!-- Intro -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">How it works</h2>
          <p class="opacity-70 mb-4">
            An event is just a fact — <code>itemAdded</code>, <code>itemRemoved</code>. Any store
            can listen. No direct coupling between stores.
          </p>
          <div class="flex flex-wrap gap-3">
            <span class="badge badge-primary badge-outline p-3">
              <code>eventGroup</code> — defines the contract
            </span>
            <span class="badge badge-secondary badge-outline p-3">
              <code>withReducer</code> — reacts to events
            </span>
            <span class="badge badge-accent badge-outline p-3">
              <code>injectDispatch</code> — fires events
            </span>
          </div>
        </div>
      </section>

      <!-- Live demo -->
      <section class="card bg-base-100 shadow-xl border-2 border-info">
        <div class="card-body">
          <h2 class="card-title text-2xl">Live Demo</h2>
          <p class="opacity-70 mb-6">
            Toggle items below. Watch both stores react to the same events — independently.
          </p>

          <!-- Product toggle buttons -->
          <h3 class="font-semibold mb-3">Products</h3>
          <ul class="space-y-2 mb-8">
            @for (item of cartStore.cartItems(); track item.id) {
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
                  {{ item.inCart ? 'Remove' : 'Add' }}
                </button>
              </li>
            }
          </ul>

          <!-- Two stores side by side -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-4 bg-base-200 rounded-lg">
              <h3 class="font-bold mb-3 flex items-center gap-2">
                <span class="badge badge-primary">CartStore</span>
                <span class="text-sm opacity-60">updated via method</span>
              </h3>
              @if (cartStore.cartOnlyItems().length === 0) {
                <p class="text-sm opacity-50">No items in cart yet.</p>
              } @else {
                <ul class="space-y-1 mb-2">
                  @for (item of cartStore.cartOnlyItems(); track item.id) {
                    <li class="text-sm p-2 bg-base-100 rounded flex justify-between">
                      <span>{{ item.name }}</span>
                      <span>{{ item.price | currency }}</span>
                    </li>
                  }
                </ul>
                <p class="font-semibold text-sm">Total: {{ cartStore.cartTotal() | currency }}</p>
              }
            </div>

            <div class="p-4 bg-base-200 rounded-lg">
              <h3 class="font-bold mb-3 flex items-center gap-2">
                <span class="badge badge-secondary">NotificationStore</span>
                <span class="text-sm opacity-60">reacts via withReducer</span>
              </h3>
              @if (notificationStore.notifications().length === 0) {
                <p class="text-sm opacity-50">No events fired yet.</p>
              } @else {
                <ul class="space-y-1 max-h-48 overflow-y-auto">
                  @for (n of notificationStore.notifications(); track n.id) {
                    <li class="text-sm p-2 bg-base-100 rounded flex justify-between">
                      <span>{{ n.message }}</span>
                      <span class="opacity-50 text-xs">{{ n.timestamp }}</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Key point -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="text-center text-lg font-semibold">
            Neither store knows about the other. They only share the event definition.
          </p>
        </div>
      </section>
    </div>
  `,
})
export class EventsComponent {
  readonly cartStore = inject(CartStore);
  readonly notificationStore = inject(NotificationStore);
  private readonly dispatch = injectDispatch(cartEvents);

  toggleItem(item: CartItem) {
    this.cartStore.toggleInCart(item.id);
    if (item.inCart) {
      this.dispatch.itemRemoved({ name: item.name });
    } else {
      this.dispatch.itemAdded({ name: item.name, price: item.price });
    }
  }
}
```

- [ ] **Step 2: Verify**

Run: `ng serve`
Open `/events`. Verify:

- All 5 products appear with toggle buttons
- Toggling an item updates both the CartStore box (in-cart items + total) and the NotificationStore box (event log)
- Notification bell in navbar also updates
- Cart state is shared with the SignalStore page (same `providedIn: 'root'` instance)

---

### Task 7: Create TestingComponent

**Files:**

- Create: `src/app/features/testing/testing.component.ts`

- [ ] **Step 1: Create the testing directory and component**

```ts
// src/app/features/testing/testing.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-testing-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">Testing</h1>
      <p class="text-lg opacity-70">
        If all logic lives in the store, the store is the only thing you need to test.
      </p>

      <!-- Intro -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="text-lg">
            The component just calls <code>inject(CartStore)</code> and binds to signals in the
            template. There is no logic in the component to test.
          </p>
        </div>
      </section>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- What you test -->
        <div>
          <h2 class="text-xl font-bold mb-4">What you test</h2>
          <div class="space-y-3">
            @for (test of tests; track test.name) {
              <div class="p-4 bg-base-200 rounded-lg border-l-4 border-success">
                <p class="font-mono text-sm font-bold">it('{{ test.name }}')</p>
                <p class="text-sm opacity-70 mt-1">{{ test.description }}</p>
              </div>
            }
          </div>
        </div>

        <!-- What you don't need -->
        <div>
          <h2 class="text-xl font-bold mb-4">What you don't need</h2>
          <ul class="space-y-3">
            @for (item of notNeeded; track item) {
              <li class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <span class="text-error font-bold text-lg leading-none" aria-hidden="true">✕</span>
                <span class="font-mono text-sm">{{ item }}</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Bottom card -->
      <section class="card border-2 border-success">
        <div class="card-body">
          <p class="text-center font-semibold text-lg">
            All your logic is in the store. Test the store — you have tested the feature.
          </p>
        </div>
      </section>
    </div>
  `,
})
export class TestingComponent {
  readonly tests = [
    {
      name: 'initial state is correct',
      description: 'State has 5 items, all with inCart: false. cartTotal is 0.',
    },
    {
      name: 'toggleInCart updates the right item',
      description: 'Only the targeted item flips inCart. All others stay unchanged.',
    },
    {
      name: 'cartTotal recomputes after toggle',
      description: 'The computed value updates automatically when an item is added to the cart.',
    },
  ];

  readonly notNeeded = [
    'TestBed',
    'Component fixture',
    'HTTP mocking for pure logic',
    'Spy on dispatch',
  ];
}
```

- [ ] **Step 2: Verify**

Run: `ng serve`
Open `/testing`. Verify: intro card, two-column layout with test cards (green left border) and checklist (✕ items), and bottom success card all render correctly.

---

### Task 8: Update CustomFeaturesComponent

Remove all code snippets and the rxMethod section. Keep `withLogger` and the `withRequestStateAndErrorHandling` live demo.

**Files:**

- Modify: `src/app/features/custom-features/custom-features.component.ts`

- [ ] **Step 1: Replace custom-features.component.ts**

```ts
// src/app/features/custom-features/custom-features.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoApiStore } from './demo-api.store';

@Component({
  selector: 'app-custom-features-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-8xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">Custom Store Features</h1>
      <p class="text-lg opacity-70">
        <code>signalStoreFeature</code> lets you extract reusable store behavior — one line to add
        it to any store.
      </p>

      <!-- Intro -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="opacity-70">
            These are features <strong>you write</strong>. Not built-in to SignalStore, but built
            the same way. Drop them into any store with one line.
          </p>
        </div>
      </section>

      <!-- Section 1: withLogger -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-primary badge-lg">1</span>
            <code class="text-primary">withLogger</code>
          </h2>
          <p class="opacity-70 mb-4">
            Logs every state change to the console. One line to add to any store.
          </p>
          <div role="note" class="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Open DevTools console and interact with the previous pages to see it in action.
            </span>
          </div>
        </div>
      </section>

      <!-- Section 2: withRequestStateAndErrorHandling -->
      <section class="card bg-base-100 shadow-xl border-2 border-accent">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-accent badge-lg">2</span>
            <code class="text-accent">withRequestStateAndErrorHandling</code>
          </h2>
          <p class="opacity-70 mb-4">
            Tracks loading, success, and error for any HTTP call. Returns a
            <code>handleRequest</code> operator — pipe any request through it. Uses
            <code>rxMethod</code> under the hood.
          </p>

          <h3 class="font-semibold text-lg mb-3">Live Demo</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <button
                  class="btn btn-primary"
                  [class.btn-disabled]="store.requestLoading()"
                  (click)="store.loadUsers()"
                >
                  @if (store.requestLoading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Load Users
                </button>
                <button
                  class="btn btn-error"
                  [class.btn-disabled]="store.requestLoading()"
                  (click)="store.simulateError()"
                >
                  @if (store.requestLoading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Simulate Error
                </button>
                <button class="btn btn-ghost" (click)="store.reset()">Reset</button>
              </div>

              <div class="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
                <span class="font-semibold text-sm">Status:</span>
                @if (store.requestLoading()) {
                  <span class="badge badge-warning gap-1">
                    <span class="loading loading-spinner loading-xs"></span>
                    loading
                  </span>
                } @else if (store.requestSuccess() === true) {
                  <span class="badge badge-success">success</span>
                } @else if (store.requestSuccess() === false) {
                  <span class="badge badge-error">error</span>
                } @else {
                  <span class="badge badge-ghost">idle</span>
                }
              </div>

              @if (store.requestSuccess() === false && store.requestError()) {
                <div role="alert" class="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{{ store.requestError() }}</span>
                </div>
              }
            </div>

            <div>
              @if (store.users().length > 0) {
                <div class="overflow-x-auto">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (user of store.users(); track user.id) {
                        <tr>
                          <td>{{ user.name }}</td>
                          <td class="text-sm opacity-70">{{ user.email }}</td>
                          <td class="text-sm">{{ user.company.name }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else if (store.requestSuccess() === undefined && !store.requestLoading()) {
                <div class="flex items-center justify-center h-32 opacity-50">
                  Click "Load Users" to fetch from JSONPlaceholder API
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class CustomFeaturesComponent {
  readonly store = inject(DemoApiStore);
}
```

- [ ] **Step 2: Verify**

Run: `ng serve`
Open `/custom-features`. Verify:

- No code snippets visible anywhere
- withLogger section shows the DevTools info alert
- Load Users fetches data and shows the table
- Simulate Error shows the error badge and message
- Reset clears state back to idle

---

## Final End-to-End Check

After all tasks complete, navigate through all 5 pages in order and verify the full flow:

1. `/signals` — GIF cards load, sync counter: zone counter freezes, signal updates. Async demo: plain property freezes after 1s, signal updates. Force CDR fixes the plain property.
2. `/signal-store` — All 5 products in Sections 1 and 3. Toggle items — Section 2 cart summary updates. Notification bell counts up.
3. `/events` — All 5 products visible. Toggle items — both CartStore box and NotificationStore box update. Notification bell updates.
4. `/testing` — Three styled test cards on the left, four ✕ checklist items on the right, bottom card renders.
5. `/custom-features` — Load Users shows the table, Simulate Error shows error badge, Reset clears it.
