# SignalStore Presentation Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the SignalStore presentation page with a real NgRx side-by-side comparison, richer code examples (withHooks, withEventHandlers), a search/filter live demo, and replace the testing page with actual test code.

**Architecture:** Four files change. The cart store gains search state. The signal-store template is fully rewritten with a Classic NgRx comparison section, per-section NgRx callouts using `<details>`, new withHooks and withEventHandlers sections, and a search input in the withMethods demo. The testing component template is replaced with a real Vitest/TestBed spec shown as syntax-highlighted code.

**Tech Stack:** Angular 21, NgRx Signals 21, `@ngrx/signals/events`, Vitest (via `@angular/build:unit-test`), DaisyUI/Tailwind

---

## File Map

| File | Change |
|---|---|
| `src/app/features/signal-store/store/cart.store.ts` | Add `searchQuery` state, `filteredItems` computed, `setSearchQuery` method |
| `src/app/features/signal-store/store/cart.store.spec.ts` | Create — full store test suite |
| `src/app/features/signal-store/signal-store.component.ts` | Add toggle signals for new sections |
| `src/app/features/signal-store/signal-store.component.html` | Full rewrite |
| `src/app/features/testing/testing.component.ts` | Replace template with real test spec display |

---

## Task 1: Add search to CartStore (TDD)

**Files:**
- Create: `src/app/features/signal-store/store/cart.store.spec.ts`
- Modify: `src/app/features/signal-store/store/cart.store.ts`

- [ ] **Step 1: Create the spec file**

```ts
// src/app/features/signal-store/store/cart.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let store: InstanceType<typeof CartStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CartStore] });
    store = TestBed.inject(CartStore);
  });

  it('initial state is correct', () => {
    expect(store.cartItems().length).toBe(5);
    expect(store.cartTotal()).toBe(0);
    expect(store.searchQuery()).toBe('');
  });

  it('toggleInCart updates the right item', () => {
    store.toggleInCart(1);
    expect(store.cartItems()[0].inCart).toBe(true);
    expect(store.cartItems()[1].inCart).toBe(false);
  });

  it('cartTotal recomputes after toggle', () => {
    store.toggleInCart(1);
    expect(store.cartTotal()).toBe(59.99);
  });

  it('setSearchQuery filters items by name (case-insensitive)', () => {
    store.setSearchQuery('keyboard');
    expect(store.filteredItems().length).toBe(1);
    expect(store.filteredItems()[0].name).toBe('Mechanical Keyboard');
  });

  it('filteredItems returns all items when search is empty', () => {
    store.setSearchQuery('');
    expect(store.filteredItems().length).toBe(5);
  });

  it('filteredItems preserves cart state when filtering', () => {
    store.toggleInCart(2); // Mechanical Keyboard
    store.setSearchQuery('keyboard');
    expect(store.filteredItems()[0].inCart).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect failures for searchQuery/filteredItems/setSearchQuery**

```bash
ng test --include="**/cart.store.spec.ts"
```

Expected: 3 failures — `store.searchQuery is not a function`, `store.filteredItems is not a function`, `store.setSearchQuery is not a function`

- [ ] **Step 3: Update cart.store.ts**

Replace the contents of `src/app/features/signal-store/store/cart.store.ts`:

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
  withComputed(({ cartItems, searchQuery }) => ({
    cartOnlyItems: computed(() => cartItems().filter((item) => item.inCart)),
    cartTotal: computed(() =>
      cartItems()
        .filter((item) => item.inCart)
        .reduce((sum, item) => sum + item.price, 0),
    ),
    filteredItems: computed(() =>
      cartItems().filter((item) =>
        item.name.toLowerCase().includes(searchQuery().toLowerCase()),
      ),
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
```

- [ ] **Step 4: Run tests — all 6 should pass**

```bash
ng test --include="**/cart.store.spec.ts"
```

Expected: 6 passing

- [ ] **Step 5: Commit**

```bash
git add src/app/features/signal-store/store/cart.store.ts src/app/features/signal-store/store/cart.store.spec.ts
git commit -m "feat: add search state and filteredItems computed to CartStore"
```

---

## Task 2: Update signal-store.component.ts

**Files:**
- Modify: `src/app/features/signal-store/signal-store.component.ts`

- [ ] **Step 1: Replace the component file**

```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartItem, CartStore } from './store/cart.store';

@Component({
  selector: 'app-signal-store-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './signal-store.component.html',
})
export class SignalStoreComponent {
  readonly store = inject(CartStore);

  // Why SignalStore — NgRx comparison panels
  readonly ngrxActionsOpen = signal(false);
  readonly ngrxReducerOpen = signal(false);
  readonly ngrxSelectorsOpen = signal(false);
  readonly ngrxEffectsOpen = signal(false);
  readonly signalStoreOpen = signal(false);

  // withX section code panels
  readonly withStateOpen = signal(false);
  readonly withComputedOpen = signal(false);
  readonly withMethodsOpen = signal(false);
  readonly rxMethodOpen = signal(false);
  readonly withHooksOpen = signal(false);
  readonly withEventHandlersOpen = signal(false);

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
  }

  onSearch(event: Event) {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/features/signal-store/signal-store.component.ts
git commit -m "feat: add toggle signals and onSearch to SignalStoreComponent"
```

---

## Task 3: Rewrite signal-store.component.html

**Files:**
- Modify: `src/app/features/signal-store/signal-store.component.html`

- [ ] **Step 1: Replace the entire file with the following content**

```html
<div class="max-w-8xl mx-auto p-4 space-y-8">

  <!-- Page header -->
  <div>
    <h1 class="text-3xl font-bold">NgRx SignalStore</h1>
    <p class="text-lg opacity-70 mt-1">
      One file replaces four. State management built on Angular Signals.
    </p>
  </div>

  <!-- Why SignalStore? -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-6">
      <h2 class="card-title text-2xl">Why SignalStore?</h2>
      <p class="opacity-70">
        Classic NgRx is a proven pattern for large-scale Angular apps. But it has a cost: every
        feature requires four files working in concert. SignalStore replaces all of that with a
        single, functional API built on Angular Signals.
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Classic NgRx column -->
        <div class="space-y-3">
          <div class="badge badge-error badge-outline badge-lg">Classic NgRx — 4 files</div>

          <!-- actions.ts -->
          <div class="border border-error/30 rounded-lg overflow-hidden">
            <button
              class="w-full flex items-center justify-between p-3 bg-error/10 text-left"
              (click)="ngrxActionsOpen.set(!ngrxActionsOpen())"
              [attr.aria-expanded]="ngrxActionsOpen()"
            >
              <span class="font-mono text-sm font-semibold">actions.ts</span>
              <span aria-hidden="true">{{ ngrxActionsOpen() ? '▼' : '▶' }}</span>
            </button>
            @if (ngrxActionsOpen()) {
              <pre
                class="p-4 text-sm overflow-x-auto leading-relaxed"
                style="background: #1e1e2e; color: #cdd6f4"
              ><code><span style="color:#6c7086">// Name every user intent as a typed action object</span>
<span style="color:#cba6f7">import</span> { createAction, props } <span style="color:#cba6f7">from</span> <span style="color:#a6e3a1">'@ngrx/store'</span>;

<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">toggleInCart</span> = <span style="color:#cba6f7">createAction</span>(
  <span style="color:#a6e3a1">'[Cart] Toggle Item'</span>,
  <span style="color:#cba6f7">props</span>&lt;&#123; <span style="color:#89b4fa">itemId</span>: <span style="color:#cba6f7">number</span> &#125;&gt;()
);</code></pre>
            }
          </div>

          <!-- reducer.ts -->
          <div class="border border-error/30 rounded-lg overflow-hidden">
            <button
              class="w-full flex items-center justify-between p-3 bg-error/10 text-left"
              (click)="ngrxReducerOpen.set(!ngrxReducerOpen())"
              [attr.aria-expanded]="ngrxReducerOpen()"
            >
              <span class="font-mono text-sm font-semibold">reducer.ts</span>
              <span aria-hidden="true">{{ ngrxReducerOpen() ? '▼' : '▶' }}</span>
            </button>
            @if (ngrxReducerOpen()) {
              <pre
                class="p-4 text-sm overflow-x-auto leading-relaxed"
                style="background: #1e1e2e; color: #cdd6f4"
              ><code><span style="color:#6c7086">// Define state shape + how each action changes it</span>
<span style="color:#cba6f7">import</span> { createReducer, on } <span style="color:#cba6f7">from</span> <span style="color:#a6e3a1">'@ngrx/store'</span>;
<span style="color:#cba6f7">import</span> { toggleInCart } <span style="color:#cba6f7">from</span> <span style="color:#a6e3a1">'./cart.actions'</span>;

<span style="color:#cba6f7">export interface</span> <span style="color:#89b4fa">CartState</span> &#123; <span style="color:#89b4fa">cartItems</span>: <span style="color:#89b4fa">CartItem</span>[] &#125;

<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">initialState</span>: <span style="color:#89b4fa">CartState</span> = &#123;
  <span style="color:#89b4fa">cartItems</span>: [&#123; <span style="color:#89b4fa">id</span>: <span style="color:#fab387">1</span>, <span style="color:#89b4fa">name</span>: <span style="color:#a6e3a1">'Wireless Headphones'</span>, ... &#125;],
&#125;;

<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">cartReducer</span> = <span style="color:#cba6f7">createReducer</span>(
  initialState,
  <span style="color:#cba6f7">on</span>(toggleInCart, (state, &#123; itemId &#125;) => (&#123;
    ...state,
    <span style="color:#89b4fa">cartItems</span>: state.<span style="color:#89b4fa">cartItems</span>.<span style="color:#89b4fa">map</span>(item =>
      item.<span style="color:#89b4fa">id</span> === itemId
        ? &#123; ...item, <span style="color:#89b4fa">inCart</span>: !item.<span style="color:#89b4fa">inCart</span> &#125;
        : item
    ),
  &#125;))
);</code></pre>
            }
          </div>

          <!-- selectors.ts -->
          <div class="border border-error/30 rounded-lg overflow-hidden">
            <button
              class="w-full flex items-center justify-between p-3 bg-error/10 text-left"
              (click)="ngrxSelectorsOpen.set(!ngrxSelectorsOpen())"
              [attr.aria-expanded]="ngrxSelectorsOpen()"
            >
              <span class="font-mono text-sm font-semibold">selectors.ts</span>
              <span aria-hidden="true">{{ ngrxSelectorsOpen() ? '▼' : '▶' }}</span>
            </button>
            @if (ngrxSelectorsOpen()) {
              <pre
                class="p-4 text-sm overflow-x-auto leading-relaxed"
                style="background: #1e1e2e; color: #cdd6f4"
              ><code><span style="color:#6c7086">// Derive values from state — memoized, composable</span>
<span style="color:#cba6f7">import</span> { createFeatureSelector, createSelector } <span style="color:#cba6f7">from</span> <span style="color:#a6e3a1">'@ngrx/store'</span>;

<span style="color:#cba6f7">const</span> <span style="color:#89b4fa">selectCart</span> = <span style="color:#cba6f7">createFeatureSelector</span>&lt;<span style="color:#89b4fa">CartState</span>&gt;(<span style="color:#a6e3a1">'cart'</span>);
<span style="color:#cba6f7">const</span> <span style="color:#89b4fa">selectItems</span> = <span style="color:#cba6f7">createSelector</span>(selectCart, s => s.<span style="color:#89b4fa">cartItems</span>);

<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">selectCartOnlyItems</span> = <span style="color:#cba6f7">createSelector</span>(
  selectItems, items => items.<span style="color:#89b4fa">filter</span>(i => i.<span style="color:#89b4fa">inCart</span>)
);
<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">selectCartTotal</span> = <span style="color:#cba6f7">createSelector</span>(
  selectCartOnlyItems,
  items => items.<span style="color:#89b4fa">reduce</span>((sum, i) => sum + i.<span style="color:#89b4fa">price</span>, <span style="color:#fab387">0</span>)
);</code></pre>
            }
          </div>

          <!-- effects.ts -->
          <div class="border border-error/30 rounded-lg overflow-hidden">
            <button
              class="w-full flex items-center justify-between p-3 bg-error/10 text-left"
              (click)="ngrxEffectsOpen.set(!ngrxEffectsOpen())"
              [attr.aria-expanded]="ngrxEffectsOpen()"
            >
              <span class="font-mono text-sm font-semibold">effects.ts</span>
              <span aria-hidden="true">{{ ngrxEffectsOpen() ? '▼' : '▶' }}</span>
            </button>
            @if (ngrxEffectsOpen()) {
              <pre
                class="p-4 text-sm overflow-x-auto leading-relaxed"
                style="background: #1e1e2e; color: #cdd6f4"
              ><code><span style="color:#6c7086">// Async operations and side effects — separate class, separate file</span>
<span style="color:#cba6f7">import</span> { inject, Injectable } <span style="color:#cba6f7">from</span> <span style="color:#a6e3a1">'@angular/core'</span>;
<span style="color:#cba6f7">import</span> { Actions, createEffect, ofType } <span style="color:#cba6f7">from</span> <span style="color:#a6e3a1">'@ngrx/effects'</span>;

<span style="color:#cba6f7">@Injectable</span>()
<span style="color:#cba6f7">export class</span> <span style="color:#89b4fa">CartEffects</span> &#123;
  <span style="color:#cba6f7">private</span> <span style="color:#89b4fa">actions$</span> = <span style="color:#cba6f7">inject</span>(Actions);
  <span style="color:#cba6f7">private</span> <span style="color:#89b4fa">http</span> = <span style="color:#cba6f7">inject</span>(HttpClient);

  <span style="color:#89b4fa">loadProducts$</span> = <span style="color:#cba6f7">createEffect</span>(() =>
    <span style="color:#cba6f7">this</span>.<span style="color:#89b4fa">actions$</span>.<span style="color:#89b4fa">pipe</span>(
      <span style="color:#cba6f7">ofType</span>(loadProducts),
      <span style="color:#cba6f7">switchMap</span>(() =>
        <span style="color:#cba6f7">this</span>.<span style="color:#89b4fa">http</span>.<span style="color:#89b4fa">get</span>&lt;<span style="color:#89b4fa">CartItem</span>[]&gt;(<span style="color:#a6e3a1">'/api/products'</span>).<span style="color:#89b4fa">pipe</span>(
          <span style="color:#cba6f7">map</span>(products => <span style="color:#cba6f7">loadProductsSuccess</span>(&#123; products &#125;))
        )
      )
    )
  );
&#125;</code></pre>
            }
          </div>
        </div>

        <!-- SignalStore column -->
        <div class="space-y-3">
          <div class="badge badge-success badge-outline badge-lg">SignalStore — 1 file</div>

          <div class="border border-success/30 rounded-lg overflow-hidden">
            <button
              class="w-full flex items-center justify-between p-3 bg-success/10 text-left"
              (click)="signalStoreOpen.set(!signalStoreOpen())"
              [attr.aria-expanded]="signalStoreOpen()"
            >
              <span class="font-mono text-sm font-semibold">cart.store.ts</span>
              <span aria-hidden="true">{{ signalStoreOpen() ? '▼' : '▶' }}</span>
            </button>
            @if (signalStoreOpen()) {
              <pre
                class="p-4 text-sm overflow-x-auto leading-relaxed"
                style="background: #1e1e2e; color: #cdd6f4"
              ><code><span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">CartStore</span> = <span style="color:#cba6f7">signalStore</span>(
  &#123; providedIn: <span style="color:#a6e3a1">'root'</span> &#125;,

  <span style="color:#6c7086">// replaces: initialState in reducer.ts</span>
  <span style="color:#cba6f7">withState</span>(&#123;
    <span style="color:#89b4fa">cartItems</span>: [&#123; <span style="color:#89b4fa">id</span>: <span style="color:#fab387">1</span>, <span style="color:#89b4fa">name</span>: <span style="color:#a6e3a1">'Wireless Headphones'</span>, ... &#125;],
  &#125;),

  <span style="color:#6c7086">// replaces: selectors.ts</span>
  <span style="color:#cba6f7">withComputed</span>((&#123; cartItems &#125;) => (&#123;
    <span style="color:#89b4fa">cartOnlyItems</span>: <span style="color:#cba6f7">computed</span>(() => cartItems().<span style="color:#89b4fa">filter</span>(i => i.<span style="color:#89b4fa">inCart</span>)),
    <span style="color:#89b4fa">cartTotal</span>: <span style="color:#cba6f7">computed</span>(() =>
      cartItems().<span style="color:#89b4fa">filter</span>(i => i.<span style="color:#89b4fa">inCart</span>)
        .<span style="color:#89b4fa">reduce</span>((sum, i) => sum + i.<span style="color:#89b4fa">price</span>, <span style="color:#fab387">0</span>)
    ),
  &#125;)),

  <span style="color:#6c7086">// replaces: actions.ts + reducer.ts on() handler</span>
  <span style="color:#cba6f7">withMethods</span>((store) => (&#123;
    <span style="color:#89b4fa">toggleInCart</span>(itemId: <span style="color:#cba6f7">number</span>) &#123;
      <span style="color:#cba6f7">patchState</span>(store, state => (&#123;
        <span style="color:#89b4fa">cartItems</span>: state.<span style="color:#89b4fa">cartItems</span>.<span style="color:#89b4fa">map</span>(item =>
          item.<span style="color:#89b4fa">id</span> === itemId
            ? &#123; ...item, <span style="color:#89b4fa">inCart</span>: !item.<span style="color:#89b4fa">inCart</span> &#125; : item
        ),
      &#125;));
    &#125;,
  &#125;)),

  <span style="color:#6c7086">// replaces: effects.ts lifecycle + withEventHandlers for side effects</span>
  <span style="color:#cba6f7">withHooks</span>(&#123;
    <span style="color:#89b4fa">onInit</span>: (store) => console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">'Store ready'</span>, store),
    <span style="color:#89b4fa">onDestroy</span>: (store) => console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">'Cleanup'</span>, store),
  &#125;),
);</code></pre>
            }
          </div>
        </div>
      </div>

      <!-- Mapping table -->
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-sm">
          <thead>
            <tr>
              <th>Classic NgRx file</th>
              <th>Purpose</th>
              <th>SignalStore equivalent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>actions.ts</code></td>
              <td class="opacity-70">Name every user intent</td>
              <td><code>withMethods</code></td>
            </tr>
            <tr>
              <td><code>reducer.ts</code></td>
              <td class="opacity-70">Define state + apply changes</td>
              <td><code>withState</code> + <code>withMethods</code></td>
            </tr>
            <tr>
              <td><code>selectors.ts</code></td>
              <td class="opacity-70">Derive computed values</td>
              <td><code>withComputed</code></td>
            </tr>
            <tr>
              <td><code>effects.ts</code></td>
              <td class="opacity-70">Async ops + side effects</td>
              <td><code>rxMethod</code> + <code>withEventHandlers</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- 1. withState -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-primary badge-lg">1</span>
          <code class="text-primary">withState</code>
        </h2>
        <p class="opacity-70 mt-1">
          Define what your app needs to remember. Every property becomes a live signal automatically.
        </p>
      </div>
      <p class="text-sm opacity-60">
        You describe the shape of your data once. SignalStore turns each property into a signal — a
        reactive value that updates the UI whenever it changes. No boilerplate, no decorators.
      </p>

      <details class="rounded-lg border border-base-300">
        <summary class="cursor-pointer p-3 text-sm font-mono opacity-60 select-none">
          In Classic NgRx — <code>reducer.ts</code> initial state
        </summary>
        <pre
          class="p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// reducer.ts — state shape lived here, mixed with mutation logic</span>
<span style="color:#cba6f7">export interface</span> <span style="color:#89b4fa">CartState</span> &#123; <span style="color:#89b4fa">cartItems</span>: <span style="color:#89b4fa">CartItem</span>[] &#125;
<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">initialState</span>: <span style="color:#89b4fa">CartState</span> = &#123; <span style="color:#89b4fa">cartItems</span>: [] &#125;;
<span style="color:#6c7086">// To read in a component: inject Store, then store.select(selectCartItems)</span></code></pre>
      </details>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-primary"
        (click)="withStateOpen.set(!withStateOpen())"
        [attr.aria-expanded]="withStateOpen()"
      >
        {{ withStateOpen() ? '▼' : '▶' }} View code — withState
      </button>
      @if (withStateOpen()) {
        <pre
          class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">CartStore</span> = <span style="color:#cba6f7">signalStore</span>(
  <span style="color:#cba6f7">withState</span>(&#123;
    <span style="color:#89b4fa">cartItems</span>: [
      &#123; <span style="color:#89b4fa">id</span>: <span style="color:#fab387">1</span>, <span style="color:#89b4fa">name</span>: <span style="color:#a6e3a1">'Wireless Headphones'</span>, <span style="color:#89b4fa">price</span>: <span style="color:#fab387">59.99</span>, <span style="color:#89b4fa">inCart</span>: <span style="color:#fab387">false</span> &#125;,
      &#123; <span style="color:#89b4fa">id</span>: <span style="color:#fab387">2</span>, <span style="color:#89b4fa">name</span>: <span style="color:#a6e3a1">'Mechanical Keyboard'</span>,  <span style="color:#89b4fa">price</span>: <span style="color:#fab387">89.99</span>, <span style="color:#89b4fa">inCart</span>: <span style="color:#fab387">false</span> &#125;,
      <span style="color:#6c7086">// ...</span>
    ],
  &#125;),
  <span style="color:#6c7086">// cartItems is now a signal: store.cartItems()</span>
);</code></pre>
      }

      <h3 class="font-semibold">Live: All Products</h3>
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

  <!-- 2. withComputed -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-secondary badge-lg">2</span>
          <code class="text-secondary">withComputed</code>
        </h2>
        <p class="opacity-70 mt-1">Derived values that stay in sync — no manual recalculation.</p>
      </div>
      <p class="text-sm opacity-60">
        Computed values are calculated from existing state. When the source changes, computed values
        update automatically. Add items to the cart or search in Section 3 to see them update here.
      </p>

      <details class="rounded-lg border border-base-300">
        <summary class="cursor-pointer p-3 text-sm font-mono opacity-60 select-none">
          In Classic NgRx — <code>selectors.ts</code>
        </summary>
        <pre
          class="p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// selectors.ts — composable, memoized, but verbose</span>
<span style="color:#cba6f7">const</span> <span style="color:#89b4fa">selectCart</span> = <span style="color:#cba6f7">createFeatureSelector</span>&lt;<span style="color:#89b4fa">CartState</span>&gt;(<span style="color:#a6e3a1">'cart'</span>);
<span style="color:#cba6f7">const</span> <span style="color:#89b4fa">selectItems</span> = <span style="color:#cba6f7">createSelector</span>(selectCart, s => s.<span style="color:#89b4fa">cartItems</span>);
<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">selectCartTotal</span> = <span style="color:#cba6f7">createSelector</span>(
  selectItems,
  items => items.<span style="color:#89b4fa">filter</span>(i => i.<span style="color:#89b4fa">inCart</span>).<span style="color:#89b4fa">reduce</span>((sum, i) => sum + i.<span style="color:#89b4fa">price</span>, <span style="color:#fab387">0</span>)
);</code></pre>
      </details>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-secondary"
        (click)="withComputedOpen.set(!withComputedOpen())"
        [attr.aria-expanded]="withComputedOpen()"
      >
        {{ withComputedOpen() ? '▼' : '▶' }} View code — withComputed
      </button>
      @if (withComputedOpen()) {
        <pre
          class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#cba6f7">withComputed</span>((&#123; <span style="color:#89b4fa">cartItems</span>, <span style="color:#89b4fa">searchQuery</span> &#125;) => (&#123;
  <span style="color:#89b4fa">cartOnlyItems</span>: <span style="color:#cba6f7">computed</span>(() => cartItems().<span style="color:#89b4fa">filter</span>(item => item.<span style="color:#89b4fa">inCart</span>)),
  <span style="color:#89b4fa">cartTotal</span>: <span style="color:#cba6f7">computed</span>(() =>
    cartItems().<span style="color:#89b4fa">filter</span>(item => item.<span style="color:#89b4fa">inCart</span>)
      .<span style="color:#89b4fa">reduce</span>((sum, item) => sum + item.<span style="color:#89b4fa">price</span>, <span style="color:#fab387">0</span>)
  ),
  <span style="color:#6c7086">// reacts to TWO signals at once — searchQuery AND cartItems</span>
  <span style="color:#89b4fa">filteredItems</span>: <span style="color:#cba6f7">computed</span>(() =>
    cartItems().<span style="color:#89b4fa">filter</span>(item =>
      item.<span style="color:#89b4fa">name</span>.<span style="color:#89b4fa">toLowerCase</span>().<span style="color:#89b4fa">includes</span>(searchQuery().<span style="color:#89b4fa">toLowerCase</span>())
    )
  ),
&#125;))</code></pre>
      }

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
        <ul class="mt-2 space-y-1">
          @for (item of store.cartOnlyItems(); track item.id) {
            <li class="flex justify-between p-2 bg-base-200 rounded">
              <span>{{ item.name }}</span>
              <span>{{ item.price | currency }}</span>
            </li>
          }
        </ul>
      }

      <div class="alert bg-base-200 border border-base-300">
        <span>
          💡 <strong>Key insight:</strong> <code>filteredItems</code> reacts to both
          <code>cartItems</code> and <code>searchQuery</code> simultaneously. No subscriptions,
          no manual triggers.
        </span>
      </div>
    </div>
  </section>

  <!-- 3. withMethods -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-accent badge-lg">3</span>
          <code class="text-accent">withMethods</code>
        </h2>
        <p class="opacity-70 mt-1">
          All state changes go through one place. Components just call methods.
        </p>
      </div>
      <p class="text-sm opacity-60">
        Methods are the only way to update state. Try searching and toggling items — watch Sections
        1 and 2 update reactively.
      </p>

      <details class="rounded-lg border border-base-300">
        <summary class="cursor-pointer p-3 text-sm font-mono opacity-60 select-none">
          In Classic NgRx — <code>actions.ts</code> + <code>reducer.ts</code>
        </summary>
        <pre
          class="p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// Component dispatches an action...</span>
<span style="color:#cba6f7">this</span>.<span style="color:#89b4fa">store</span>.<span style="color:#89b4fa">dispatch</span>(<span style="color:#cba6f7">toggleInCart</span>(&#123; itemId &#125;));

<span style="color:#6c7086">// ...NgRx routes it to the matching on() handler in reducer.ts</span>
<span style="color:#cba6f7">on</span>(toggleInCart, (state, &#123; itemId &#125;) => (&#123;
  ...state,
  <span style="color:#89b4fa">cartItems</span>: state.<span style="color:#89b4fa">cartItems</span>.<span style="color:#89b4fa">map</span>(item =>
    item.<span style="color:#89b4fa">id</span> === itemId ? &#123; ...item, <span style="color:#89b4fa">inCart</span>: !item.<span style="color:#89b4fa">inCart</span> &#125; : item
  ),
&#125;))</code></pre>
      </details>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-accent"
        (click)="withMethodsOpen.set(!withMethodsOpen())"
        [attr.aria-expanded]="withMethodsOpen()"
      >
        {{ withMethodsOpen() ? '▼' : '▶' }} View code — withMethods
      </button>
      @if (withMethodsOpen()) {
        <pre
          class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#cba6f7">withMethods</span>((store) => (&#123;
  <span style="color:#89b4fa">toggleInCart</span>(itemId: <span style="color:#cba6f7">number</span>) &#123;
    <span style="color:#cba6f7">patchState</span>(store, (state) => (&#123;
      <span style="color:#89b4fa">cartItems</span>: state.<span style="color:#89b4fa">cartItems</span>.<span style="color:#89b4fa">map</span>((item) =>
        item.<span style="color:#89b4fa">id</span> === itemId ? &#123; ...item, <span style="color:#89b4fa">inCart</span>: !item.<span style="color:#89b4fa">inCart</span> &#125; : item
      ),
    &#125;));
  &#125;,
  <span style="color:#89b4fa">setSearchQuery</span>(query: <span style="color:#cba6f7">string</span>) &#123;
    <span style="color:#cba6f7">patchState</span>(store, &#123; searchQuery: query &#125;);
  &#125;,
&#125;))</code></pre>
      }

      <!-- Search input -->
      <div class="form-control">
        <label class="label" for="product-search">
          <span class="label-text font-semibold">Search products</span>
        </label>
        <input
          id="product-search"
          type="search"
          class="input input-bordered w-full"
          placeholder="Type to filter…"
          [value]="store.searchQuery()"
          (input)="onSearch($event)"
          aria-label="Search products"
        />
      </div>

      <ul class="space-y-2">
        @for (item of store.filteredItems(); track item.id) {
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
        @if (store.filteredItems().length === 0) {
          <li class="p-3 text-center opacity-60">No products match "{{ store.searchQuery() }}"</li>
        }
      </ul>

      <div class="alert bg-base-200 border border-base-300">
        <span>
          💡 <strong>Key insight:</strong> Sections 1 and 2 above update reactively as you
          search and toggle. The component holds zero state.
        </span>
      </div>
    </div>
  </section>

  <!-- 4. rxMethod -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-info badge-lg">4</span>
          <code class="text-info">rxMethod</code>
        </h2>
        <p class="opacity-70 mt-1">
          A bridge between RxJS streams and your store — accepts a value, a signal, or an
          observable, and cleans up automatically.
        </p>
      </div>
      <p class="text-sm opacity-60">
        When you need to handle async operations like HTTP calls, <code>rxMethod</code> connects an
        RxJS pipeline to your store without manual subscription management.
      </p>
      <div class="flex flex-wrap gap-3">
        <span class="badge badge-info badge-outline p-3">No <code>.subscribe()</code></span>
        <span class="badge badge-info badge-outline p-3">Reactive by default</span>
        <span class="badge badge-info badge-outline p-3">Auto-cleanup on destroy</span>
      </div>

      <details class="rounded-lg border border-base-300">
        <summary class="cursor-pointer p-3 text-sm font-mono opacity-60 select-none">
          In Classic NgRx — <code>effects.ts</code>
        </summary>
        <pre
          class="p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// effects.ts — an entirely separate class just for async operations</span>
<span style="color:#cba6f7">@Injectable</span>()
<span style="color:#cba6f7">export class</span> <span style="color:#89b4fa">CartEffects</span> &#123;
  <span style="color:#89b4fa">loadProducts$</span> = <span style="color:#cba6f7">createEffect</span>(() =>
    <span style="color:#cba6f7">this</span>.<span style="color:#89b4fa">actions$</span>.<span style="color:#89b4fa">pipe</span>(
      <span style="color:#cba6f7">ofType</span>(loadProducts),
      <span style="color:#cba6f7">switchMap</span>(() => <span style="color:#cba6f7">this</span>.<span style="color:#89b4fa">http</span>.<span style="color:#89b4fa">get</span>(<span style="color:#a6e3a1">'/api/products'</span>))
    )
  );
&#125;</code></pre>
      </details>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-info"
        (click)="rxMethodOpen.set(!rxMethodOpen())"
        [attr.aria-expanded]="rxMethodOpen()"
      >
        {{ rxMethodOpen() ? '▼' : '▶' }} View code — rxMethod
      </button>
      @if (rxMethodOpen()) {
        <pre
          class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#cba6f7">withMethods</span>((store, http = <span style="color:#cba6f7">inject</span>(HttpClient)) => (&#123;
  <span style="color:#89b4fa">loadUsers</span>: <span style="color:#cba6f7">rxMethod</span>&lt;<span style="color:#cba6f7">void</span>&gt;(
    <span style="color:#cba6f7">pipe</span>(
      <span style="color:#cba6f7">tap</span>(() => store.<span style="color:#89b4fa">setLoading</span>()),
      <span style="color:#cba6f7">switchMap</span>(() =>
        http.<span style="color:#89b4fa">get</span>&lt;User[]&gt;(<span style="color:#a6e3a1">'/api/users'</span>).<span style="color:#89b4fa">pipe</span>(
          store.<span style="color:#89b4fa">handleRequest</span>(&#123;
            <span style="color:#89b4fa">next</span>: (users) => <span style="color:#cba6f7">patchState</span>(store, &#123; users &#125;),
            <span style="color:#89b4fa">error</span>: (err) => console.<span style="color:#89b4fa">error</span>(err),
          &#125;)
        )
      )
    )
  ),
&#125;))</code></pre>
      }

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

  <!-- 5. withHooks -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-warning badge-lg">5</span>
          <code class="text-warning">withHooks</code>
        </h2>
        <p class="opacity-70 mt-1">
          Lifecycle callbacks for the store — run code when the store is created or destroyed.
        </p>
      </div>
      <p class="text-sm opacity-60">
        Use <code>onInit</code> to trigger initial data loads or set up reactive effects. Use
        <code>onDestroy</code> for cleanup. The store is the right place for this — not the
        component.
      </p>

      <details class="rounded-lg border border-base-300">
        <summary class="cursor-pointer p-3 text-sm font-mono opacity-60 select-none">
          In Classic NgRx — constructor in <code>effects.ts</code>
        </summary>
        <pre
          class="p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// effects.ts — lifecycle logic lived in the constructor</span>
<span style="color:#cba6f7">@Injectable</span>()
<span style="color:#cba6f7">export class</span> <span style="color:#89b4fa">CartEffects</span> &#123;
  <span style="color:#cba6f7">constructor</span>(<span style="color:#cba6f7">private</span> actions$: Actions) &#123;
    <span style="color:#6c7086">// initialization logic here — hard to test in isolation</span>
  &#125;
&#125;</code></pre>
      </details>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-warning"
        (click)="withHooksOpen.set(!withHooksOpen())"
        [attr.aria-expanded]="withHooksOpen()"
      >
        {{ withHooksOpen() ? '▼' : '▶' }} View code — withHooks
      </button>
      @if (withHooksOpen()) {
        <pre
          class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#cba6f7">withHooks</span>(&#123;
  <span style="color:#89b4fa">onInit</span>(store) &#123;
    <span style="color:#6c7086">// called once when the store is first injected</span>
    console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">'Store initialized'</span>, store);

    <span style="color:#6c7086">// can call methods, set up effects, trigger loads...</span>
    <span style="color:#cba6f7">effect</span>(() => &#123;
      <span style="color:#cba6f7">const</span> state = <span style="color:#cba6f7">getState</span>(store);
      console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">'State changed'</span>, state);
    &#125;);
  &#125;,
  <span style="color:#89b4fa">onDestroy</span>(store) &#123;
    <span style="color:#6c7086">// called when the store is garbage collected</span>
    console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">'Store destroyed'</span>, store);
  &#125;,
&#125;)</code></pre>
      }

      <div class="alert bg-base-200 border border-base-300">
        <span>
          💡 <strong>Key insight:</strong> Custom store features like <code>withLogger</code> are
          built using <code>withHooks</code> — they wrap lifecycle logic into reusable, composable
          units.
        </span>
      </div>
    </div>
  </section>

  <!-- 6. withEventHandlers -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-neutral badge-lg">6</span>
          <code>withEventHandlers</code>
        </h2>
        <p class="opacity-70 mt-1">
          React to store events with side effects — without coupling the method that fires the event
          to the code that handles it.
        </p>
      </div>
      <p class="text-sm opacity-60">
        Use <code>withEventHandlers</code> when you need side effects in response to events (logging,
        analytics, notifications). Use <code>withReducer</code> when you need state transitions. See
        the Events page for a live demo of both.
      </p>

      <details class="rounded-lg border border-base-300">
        <summary class="cursor-pointer p-3 text-sm font-mono opacity-60 select-none">
          In Classic NgRx — <code>effects.ts</code> listening to an action
        </summary>
        <pre
          class="p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// effects.ts — listen to an action and trigger a side effect</span>
<span style="color:#89b4fa">logToggle$</span> = <span style="color:#cba6f7">createEffect</span>(() =>
  <span style="color:#cba6f7">this</span>.<span style="color:#89b4fa">actions$</span>.<span style="color:#89b4fa">pipe</span>(
    <span style="color:#cba6f7">ofType</span>(toggleInCart),
    <span style="color:#cba6f7">tap</span>((&#123; itemId &#125;) => console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">'Item toggled:'</span>, itemId))
  ),
  &#123; dispatch: <span style="color:#fab387">false</span> &#125;
);</code></pre>
      </details>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2"
        (click)="withEventHandlersOpen.set(!withEventHandlersOpen())"
        [attr.aria-expanded]="withEventHandlersOpen()"
      >
        {{ withEventHandlersOpen() ? '▼' : '▶' }} View code — withEventHandlers
      </button>
      @if (withEventHandlersOpen()) {
        <pre
          class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
          style="background: #1e1e2e; color: #cdd6f4"
        ><code><span style="color:#6c7086">// cart.events.ts — define typed events</span>
<span style="color:#cba6f7">export const</span> <span style="color:#89b4fa">cartEvents</span> = <span style="color:#cba6f7">eventGroup</span>(&#123;
  source: <span style="color:#a6e3a1">'Cart'</span>,
  events: &#123;
    <span style="color:#89b4fa">itemAdded</span>: <span style="color:#cba6f7">type</span>&lt;&#123; <span style="color:#89b4fa">name</span>: <span style="color:#cba6f7">string</span>; <span style="color:#89b4fa">price</span>: <span style="color:#cba6f7">number</span> &#125;&gt;(),
    <span style="color:#89b4fa">itemRemoved</span>: <span style="color:#cba6f7">type</span>&lt;&#123; <span style="color:#89b4fa">name</span>: <span style="color:#cba6f7">string</span> &#125;&gt;(),
  &#125;,
&#125;);

<span style="color:#6c7086">// Inside signalStore(...) — react to events with Observable side effects</span>
<span style="color:#cba6f7">withEventHandlers</span>((store, events = <span style="color:#cba6f7">inject</span>(Events)) => (&#123;
  <span style="color:#89b4fa">logCartActivity$</span>: events.<span style="color:#89b4fa">on</span>(cartEvents.itemAdded, cartEvents.itemRemoved).<span style="color:#89b4fa">pipe</span>(
    <span style="color:#cba6f7">tap</span>((&#123; type, payload &#125;) =>
      console.<span style="color:#89b4fa">log</span>(<span style="color:#a6e3a1">`[Cart] $&#123;type&#125;`</span>, payload)
    )
  ),
&#125;))</code></pre>
      }

      <div class="alert bg-base-200 border border-base-300">
        <span>
          💡 <strong>Key insight:</strong> The method that dispatches an event doesn't know or care
          what handles it. Handlers are composable and can live in any store that cares about the
          event.
        </span>
      </div>
    </div>
  </section>

</div>
```

- [ ] **Step 2: Verify the app compiles**

```bash
ng build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Verify live**

Run `ng serve`, open the SignalStore page. Confirm:
- "Why SignalStore?" shows two columns with 4 collapsible NgRx files and 1 SignalStore file
- The mapping table renders
- Each `withX` section has a collapsed `<details>` NgRx callout
- Sections 5 (withHooks) and 6 (withEventHandlers) appear
- The search input in Section 3 filters the list reactively
- Cart total in Section 2 stays correct while filtering
- No console errors

- [ ] **Step 4: Commit**

```bash
git add src/app/features/signal-store/signal-store.component.html
git commit -m "feat: rewrite signal-store page with NgRx comparison, withHooks, withEventHandlers, search demo"
```

---

## Task 4: Rewrite testing.component.ts

**Files:**
- Modify: `src/app/features/testing/testing.component.ts`

- [ ] **Step 1: Replace the file**

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
        All logic lives in the store. The store is the only thing you need to test.
      </p>

      <!-- Intro -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="text-lg">
            The component injects <code>CartStore</code> and binds signals in the template.
            There is no logic in the component to test — so we don't test it.
          </p>
        </div>
      </section>

      <!-- Real test spec -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body space-y-3">
          <h2 class="card-title text-xl">cart.store.spec.ts</h2>
          <p class="text-sm opacity-60">
            Provide the store, inject it, call methods, assert on signals. That's the whole pattern.
          </p>
          <pre
            class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
            style="background: #1e1e2e; color: #cdd6f4"
          ><code><span style="color:#cba6f7">describe</span>(<span style="color:#a6e3a1">'CartStore'</span>, () => &#123;
  <span style="color:#cba6f7">let</span> <span style="color:#89b4fa">store</span>: InstanceType&lt;<span style="color:#cba6f7">typeof</span> CartStore&gt;;

  <span style="color:#cba6f7">beforeEach</span>(() => &#123;
    <span style="color:#89b4fa">TestBed</span>.<span style="color:#89b4fa">configureTestingModule</span>(&#123;
      <span style="color:#89b4fa">providers</span>: [CartStore],
    &#125;);
    <span style="color:#89b4fa">store</span> = <span style="color:#89b4fa">TestBed</span>.<span style="color:#89b4fa">inject</span>(CartStore);
  &#125;);

  <span style="color:#cba6f7">it</span>(<span style="color:#a6e3a1">'initial state is correct'</span>, () => &#123;
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartItems</span>().<span style="color:#89b4fa">length</span>).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">5</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartTotal</span>()).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">0</span>);
  &#125;);

  <span style="color:#cba6f7">it</span>(<span style="color:#a6e3a1">'toggleInCart updates the right item'</span>, () => &#123;
    store.<span style="color:#89b4fa">toggleInCart</span>(<span style="color:#fab387">1</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartItems</span>()[<span style="color:#fab387">0</span>].<span style="color:#89b4fa">inCart</span>).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">true</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartItems</span>()[<span style="color:#fab387">1</span>].<span style="color:#89b4fa">inCart</span>).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">false</span>);
  &#125;);

  <span style="color:#cba6f7">it</span>(<span style="color:#a6e3a1">'cartTotal recomputes after toggle'</span>, () => &#123;
    store.<span style="color:#89b4fa">toggleInCart</span>(<span style="color:#fab387">1</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartTotal</span>()).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">59.99</span>);
  &#125;);
&#125;);</code></pre>
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
            @for (item of notNeeded; track item.label) {
              <li class="p-3 bg-base-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="text-error font-bold text-lg leading-none" aria-hidden="true">✕</span>
                  <span class="font-mono text-sm">{{ item.label }}</span>
                </div>
                <p class="text-sm opacity-60 mt-1 ml-7">{{ item.reason }}</p>
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
    {
      label: 'TestBed (full module setup)',
      reason: 'You only need to provide CartStore — no component, no module, no declarations.',
    },
    {
      label: 'Component fixture',
      reason: 'The component has no logic to test. All behaviour is in the store.',
    },
    {
      label: 'HTTP mocking for pure logic',
      reason: 'toggleInCart is synchronous. No HTTP involved — no mock needed.',
    },
    {
      label: 'Spy on dispatch',
      reason:
        'Classic NgRx tests verify that store.dispatch(someAction) was called. ' +
        'SignalStore has no actions — you call a method and assert on the resulting signal value directly.',
    },
  ];
}
```

- [ ] **Step 2: Verify the app compiles**

```bash
ng build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Verify live**

Run `ng serve`, open the Testing page. Confirm:
- Real test code block renders with syntax highlighting
- "What you don't need" column now shows a reason beneath each item
- "Spy on dispatch" has a clear explanation in context
- No console errors

- [ ] **Step 4: Commit**

```bash
git add src/app/features/testing/testing.component.ts
git commit -m "feat: replace testing page with real test spec and contextual explanations"
```
