# Signal Store, Events & Custom Features — Presentation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve three NgRx demo pages to be simple, explanatory, and visually pleasing for a live presentation to ~100 people (mixed crowd).

**Architecture:** HTML template rewrites and small TypeScript additions (toggle signals) across three page components. No store logic, routing, or new components required. Each page gets a story-flow layout: plain-English intro → collapsible code toggle → live demo → key insight callout.

**Tech Stack:** Angular 20+, NgRx SignalStore, Tailwind CSS v4, DaisyUI

---

## File Map

| File                                                              | Change                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/app/features/signal-store/signal-store.component.ts`         | Add 4 `signal<boolean>` toggle fields, remove unused imports |
| `src/app/features/signal-store/signal-store.component.html`       | Full rewrite — story flow layout with code toggles           |
| `src/app/features/events/events.component.ts`                     | Add 3 `signal<boolean>` toggle fields                        |
| `src/app/features/events/events.component.html`                   | Full rewrite — flow diagram, concept pills with toggles      |
| `src/app/features/custom-features/custom-features.component.ts`   | Add 2 `signal<boolean>` toggle fields                        |
| `src/app/features/custom-features/custom-features.component.html` | Full rewrite — story flow, improved withLogger callout       |

---

### Task 1: Signal Store — update component TS

**Files:**

- Modify: `src/app/features/signal-store/signal-store.component.ts`

- [ ] **Step 1: Replace the file contents**

```typescript
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

  readonly withStateOpen = signal(false);
  readonly withComputedOpen = signal(false);
  readonly withMethodsOpen = signal(false);
  readonly rxMethodOpen = signal(false);

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
  }
}
```

- [ ] **Step 2: Verify the app compiles**

Run: `ng serve`
Expected: No TypeScript errors in the terminal output

- [ ] **Step 3: Commit**

```bash
git add src/app/features/signal-store/signal-store.component.ts
git commit -m "feat: add code toggle signals to SignalStoreComponent"
```

---

### Task 2: Signal Store — rewrite HTML template

**Files:**

- Modify: `src/app/features/signal-store/signal-store.component.html`

- [ ] **Step 1: Replace the entire file contents**

```html
<div class="max-w-8xl mx-auto p-4 space-y-8">
  <!-- Page header -->
  <div>
    <h1 class="text-3xl font-bold">NgRx SignalStore</h1>
    <p class="text-lg opacity-70 mt-1">
      One file replaces four. State management built on Angular Signals.
    </p>
  </div>

  <!-- Why SignalStore -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl">Why SignalStore?</h2>
      <p class="opacity-70 mb-4">
        Classic NgRx is powerful but requires a lot of ceremony. SignalStore replaces all of that
        with a single, functional API built on Angular Signals.
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

  <!-- withState -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-primary badge-lg">1</span>
          <code class="text-primary">withState</code>
        </h2>
        <p class="opacity-70 mt-1">
          Define what your app needs to remember. Every property becomes a live signal
          automatically.
        </p>
      </div>
      <p class="text-sm opacity-60">
        You describe the shape of your data once. SignalStore turns each property into a signal — a
        reactive value that updates the UI whenever it changes. No boilerplate, no decorators.
      </p>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-primary"
        (click)="withStateOpen.set(!withStateOpen())"
        [attr.aria-expanded]="withStateOpen()"
      >
        {{ withStateOpen() ? '▼' : '▶' }} View code — withState
      </button>
      @if (withStateOpen()) {
      <pre
        class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
      ><code>export const CartStore = signalStore(
  withState(&#123;
    cartItems: [
      &#123; id: 1, name: 'Wireless Headphones', price: 59.99, inCart: false &#125;,
      &#123; id: 2, name: 'Mechanical Keyboard',  price: 89.99, inCart: false &#125;,
      // ...
    ]
  &#125;),
  // cartItems is now a signal: store.cartItems()
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

  <!-- withComputed -->
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
        update automatically. Add items to the cart in Section 3 to see them update here.
      </p>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-secondary"
        (click)="withComputedOpen.set(!withComputedOpen())"
        [attr.aria-expanded]="withComputedOpen()"
      >
        {{ withComputedOpen() ? '▼' : '▶' }} View code — withComputed
      </button>
      @if (withComputedOpen()) {
      <pre
        class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
      ><code>withComputed((&#123; cartItems &#125;) => (&#123;
  cartOnlyItems: computed(() => cartItems().filter(item => item.inCart)),
  cartTotal: computed(() =>
    cartItems()
      .filter(item => item.inCart)
      .reduce((sum, item) => sum + item.price, 0)
  ),
&#125;))</code></pre>
      } @if (store.cartOnlyItems().length === 0) {
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
        <span
          >💡 <strong>Key insight:</strong> These update automatically when the source signal
          changes. No subscriptions, no manual triggers.</span
        >
      </div>
    </div>
  </section>

  <!-- withMethods -->
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
        Methods are the only way to update state. The template calls a method, the store handles the
        rest. Watch Sections 1 and 2 update reactively as you interact below.
      </p>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-accent"
        (click)="withMethodsOpen.set(!withMethodsOpen())"
        [attr.aria-expanded]="withMethodsOpen()"
      >
        {{ withMethodsOpen() ? '▼' : '▶' }} View code — withMethods
      </button>
      @if (withMethodsOpen()) {
      <pre
        class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
      ><code>withMethods((store) => (&#123;
  toggleInCart(itemId: number) &#123;
    patchState(store, (state) => (&#123;
      cartItems: state.cartItems.map((item) =>
        item.id === itemId ? &#123; ...item, inCart: !item.inCart &#125; : item
      ),
    &#125;));
  &#125;,
&#125;))</code></pre>
      }

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

      <div class="alert bg-base-200 border border-base-300">
        <span
          >💡 <strong>Key insight:</strong> Sections 1 and 2 above update reactively when you click.
          The component doesn't manage any state itself.</span
        >
      </div>
    </div>
  </section>

  <!-- rxMethod -->
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

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-info"
        (click)="rxMethodOpen.set(!rxMethodOpen())"
        [attr.aria-expanded]="rxMethodOpen()"
      >
        {{ rxMethodOpen() ? '▼' : '▶' }} View code — rxMethod
      </button>
      @if (rxMethodOpen()) {
      <pre
        class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
      ><code>withMethods((store, http = inject(HttpClient)) => (&#123;
  loadUsers: rxMethod&lt;void&gt;(
    pipe(
      tap(() => store.setLoading()),
      switchMap(() =>
        http.get&lt;User[]&gt;('/api/users').pipe(
          store.handleRequest(&#123;
            next: (users) => patchState(store, &#123; users &#125;),
            error: (err) => console.error(err),
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
</div>
```

- [ ] **Step 2: Open the app at `/signal-store` and verify**

Check:

- Page header has the subtitle line
- All 4 sections render with intro + explanation text
- Code toggle buttons appear with `▶` arrow
- Clicking a toggle shows/hides the code block and flips to `▼`
- Cart demo still works (Add to Cart / Remove buttons update Sections 1 and 2)
- Key insight callouts appear under withComputed and withMethods

- [ ] **Step 3: Commit**

```bash
git add src/app/features/signal-store/signal-store.component.html
git commit -m "feat: rewrite signal-store page with story flow layout and code toggles"
```

---

### Task 3: Events — update component TS

**Files:**

- Modify: `src/app/features/events/events.component.ts`

- [ ] **Step 1: Replace the file contents**

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { injectDispatch } from '@ngrx/signals/events';
import { CartItem, CartStore } from '../signal-store/store/cart.store';
import { NotificationStore } from '../signal-store/store/notification.store';
import { cartEvents } from '../signal-store/store/cart.events';

@Component({
  selector: 'app-events-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './events.component.html',
})
export class EventsComponent {
  readonly cartStore = inject(CartStore);
  readonly notificationStore = inject(NotificationStore);
  private readonly dispatch = injectDispatch(cartEvents);

  readonly eventGroupOpen = signal(false);
  readonly withReducerOpen = signal(false);
  readonly injectDispatchOpen = signal(false);

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

- [ ] **Step 2: Verify the app compiles**

Run: `ng serve`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/features/events/events.component.ts
git commit -m "feat: add code toggle signals to EventsComponent"
```

---

### Task 4: Events — rewrite HTML template

**Files:**

- Modify: `src/app/features/events/events.component.html`

- [ ] **Step 1: Replace the entire file contents**

```html
<div class="max-w-8xl mx-auto p-4 space-y-8">
  <!-- Page header -->
  <div>
    <h1 class="text-3xl font-bold">Events</h1>
    <p class="text-lg opacity-70 mt-1">
      Think of events like announcements. Any part of the app can hear them — without knowing who
      else is listening.
    </p>
  </div>

  <!-- How it works -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-6">
      <h2 class="card-title text-2xl">How it works</h2>

      <!-- Flow diagram -->
      <div class="flex flex-wrap items-center justify-center gap-3 py-4">
        <div class="rounded-lg border-2 border-info bg-info/10 px-4 py-3 text-center">
          <div class="text-xs font-bold text-info mb-1">COMPONENT</div>
          <code class="text-sm">dispatch(itemAdded)</code>
        </div>
        <div class="text-2xl opacity-40">→</div>
        <div class="rounded-lg border-2 border-warning bg-warning/10 px-4 py-3 text-center">
          <div class="text-xs font-bold text-warning mb-1">EVENT BUS</div>
          <code class="text-sm">itemAdded</code>
        </div>
        <div class="text-2xl opacity-40">→</div>
        <div class="flex flex-col gap-3">
          <div class="rounded-lg border-2 border-primary bg-primary/10 px-3 py-2 text-center">
            <div class="text-xs font-bold text-primary mb-1">CartStore</div>
            <div class="text-xs opacity-70">updates items</div>
          </div>
          <div class="rounded-lg border-2 border-secondary bg-secondary/10 px-3 py-2 text-center">
            <div class="text-xs font-bold text-secondary mb-1">NotificationStore</div>
            <div class="text-xs opacity-70">logs event</div>
          </div>
        </div>
      </div>

      <p class="text-sm opacity-60 text-center">
        No direct connection between the stores. They only share the event definition.
      </p>

      <!-- Concept pills with descriptions and code toggles -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="border border-primary/30 bg-primary/5 rounded-lg p-3">
          <div class="badge badge-primary badge-outline mb-2"><code>eventGroup</code></div>
          <p class="text-sm opacity-70">
            Defines the event contract — what events exist and what data they carry.
          </p>
          <button
            class="btn btn-ghost btn-xs mt-2 gap-1 text-primary"
            (click)="eventGroupOpen.set(!eventGroupOpen())"
            [attr.aria-expanded]="eventGroupOpen()"
          >
            {{ eventGroupOpen() ? '▼' : '▶' }} View code
          </button>
          @if (eventGroupOpen()) {
          <pre
            class="bg-base-200 rounded p-3 text-xs mt-2 overflow-x-auto leading-relaxed"
          ><code>export const cartEvents = eventGroup(&#123;
  source: 'Cart',
  events: &#123;
    itemAdded: type&lt;&#123; name: string; price: number &#125;&gt;(),
    itemRemoved: type&lt;&#123; name: string &#125;&gt;(),
  &#125;,
&#125;);</code></pre>
          }
        </div>

        <div class="border border-secondary/30 bg-secondary/5 rounded-lg p-3">
          <div class="badge badge-secondary badge-outline mb-2"><code>withReducer</code></div>
          <p class="text-sm opacity-70">
            Listens to events and updates the store's state in response.
          </p>
          <button
            class="btn btn-ghost btn-xs mt-2 gap-1 text-secondary"
            (click)="withReducerOpen.set(!withReducerOpen())"
            [attr.aria-expanded]="withReducerOpen()"
          >
            {{ withReducerOpen() ? '▼' : '▶' }} View code
          </button>
          @if (withReducerOpen()) {
          <pre
            class="bg-base-200 rounded p-3 text-xs mt-2 overflow-x-auto leading-relaxed"
          ><code>withReducer(
  on(cartEvents.itemAdded, (&#123; payload &#125;, state) => (&#123;
    notifications: [
      ...state.notifications,
      &#123;
        id: state.nextId,
        message: `Added "$&#123;payload.name&#125;"`,
        timestamp: new Date().toLocaleTimeString(),
      &#125;,
    ],
    nextId: state.nextId + 1,
  &#125;)),
)</code></pre>
          }
        </div>

        <div class="border border-accent/30 bg-accent/5 rounded-lg p-3">
          <div class="badge badge-accent badge-outline mb-2"><code>injectDispatch</code></div>
          <p class="text-sm opacity-70">
            Fires events from a component. Any store listening will react.
          </p>
          <button
            class="btn btn-ghost btn-xs mt-2 gap-1 text-accent"
            (click)="injectDispatchOpen.set(!injectDispatchOpen())"
            [attr.aria-expanded]="injectDispatchOpen()"
          >
            {{ injectDispatchOpen() ? '▼' : '▶' }} View code
          </button>
          @if (injectDispatchOpen()) {
          <pre
            class="bg-base-200 rounded p-3 text-xs mt-2 overflow-x-auto leading-relaxed"
          ><code>private readonly dispatch = injectDispatch(cartEvents);

toggleItem(item: CartItem) &#123;
  if (item.inCart) &#123;
    this.dispatch.itemRemoved(&#123; name: item.name &#125;);
  &#125; else &#123;
    this.dispatch.itemAdded(&#123;
      name: item.name,
      price: item.price,
    &#125;);
  &#125;
&#125;</code></pre>
          }
        </div>
      </div>
    </div>
  </section>

  <!-- Live demo -->
  <section class="card bg-base-100 shadow-xl border-2 border-info">
    <div class="card-body space-y-6">
      <div>
        <h2 class="card-title text-2xl">Live Demo</h2>
        <p class="opacity-70 mt-1">
          Toggle items below. Watch both stores react to the same events — independently.
        </p>
      </div>

      <h3 class="font-semibold">Products</h3>
      <ul class="space-y-2">
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="p-4 bg-base-200 rounded-lg">
          <h3 class="font-bold mb-1 flex items-center gap-2">
            <span class="badge badge-primary">CartStore</span>
          </h3>
          <p class="text-xs opacity-60 mb-3">
            Reacts via <code>withMethods</code> — updates item list and total
          </p>
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
          <h3 class="font-bold mb-1 flex items-center gap-2">
            <span class="badge badge-secondary">NotificationStore</span>
          </h3>
          <p class="text-xs opacity-60 mb-3">
            Reacts via <code>withReducer</code> — logs every event independently
          </p>
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

  <!-- Key insight -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="alert bg-base-200 border border-base-300">
        <span
          >💡 <strong>Key insight:</strong> Neither store knows about the other. They only share the
          event definition. Add a third store tomorrow — zero changes to existing code.</span
        >
      </div>
    </div>
  </section>
</div>
```

- [ ] **Step 2: Open the app at `/events` and verify**

Check:

- Page header shows the announcement analogy subtitle
- Flow diagram renders clearly (COMPONENT → EVENT BUS → two stores)
- Three concept pills show with description text
- Code toggles in each pill open and close correctly
- Live demo works — toggling items updates both the CartStore panel and NotificationStore panel
- Key insight callout appears at the bottom

- [ ] **Step 3: Commit**

```bash
git add src/app/features/events/events.component.html
git commit -m "feat: rewrite events page with flow diagram, concept pills, and code toggles"
```

---

### Task 5: Custom Features — update component TS

**Files:**

- Modify: `src/app/features/custom-features/custom-features.component.ts`

- [ ] **Step 1: Replace the file contents**

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DemoApiStore } from './demo-api.store';

@Component({
  selector: 'app-custom-features-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './custom-features.component.html',
})
export class CustomFeaturesComponent {
  readonly store = inject(DemoApiStore);

  readonly withLoggerOpen = signal(false);
  readonly withRequestStateOpen = signal(false);
}
```

- [ ] **Step 2: Verify the app compiles**

Run: `ng serve`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/features/custom-features/custom-features.component.ts
git commit -m "feat: add code toggle signals to CustomFeaturesComponent"
```

---

### Task 6: Custom Features — rewrite HTML template

**Files:**

- Modify: `src/app/features/custom-features/custom-features.component.html`

- [ ] **Step 1: Replace the entire file contents**

```html
<div class="max-w-8xl mx-auto p-4 space-y-8">
  <!-- Page header -->
  <div>
    <h1 class="text-3xl font-bold">Custom Store Features</h1>
    <p class="text-lg opacity-70 mt-1">
      <code>signalStoreFeature</code> lets you package reusable store behavior and drop it into any
      store with one line.
    </p>
  </div>

  <!-- Intro -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <p class="opacity-70">
        Think of these like <strong>plugins for your store</strong>. You write them once, then add
        them anywhere. Not built into SignalStore — but built the same way, so they compose
        seamlessly.
      </p>
    </div>
  </section>

  <!-- withLogger -->
  <section class="card bg-base-100 shadow-xl">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-primary badge-lg">1</span>
          <code class="text-primary">withLogger</code>
        </h2>
        <p class="opacity-70 mt-1">
          Logs every state change to the console. One line to add to any store.
        </p>
      </div>
      <p class="text-sm opacity-60">
        A custom feature that uses <code>withHooks</code> and Angular's <code>effect()</code> to
        watch the store's state and log it whenever it changes.
      </p>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-primary"
        (click)="withLoggerOpen.set(!withLoggerOpen())"
        [attr.aria-expanded]="withLoggerOpen()"
      >
        {{ withLoggerOpen() ? '▼' : '▶' }} View code — withLogger
      </button>
      @if (withLoggerOpen()) {
      <pre
        class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
      ><code>// Define the feature (once):
export function withLogger(name: string) &#123;
  return signalStoreFeature(
    withHooks(&#123;
      onInit(store) &#123;
        effect(() => &#123;
          const state = getState(store);
          console.log(`$&#123;name&#125; state changed`, state);
        &#125;);
      &#125;,
    &#125;),
  );
&#125;

// Add to any store (one line):
export const CartStore = signalStore(
  withLogger('[CART-STORE]'),  // ← this is all you add
  withState(initialState),
  withComputed(...),
  withMethods(...),
);</code></pre>
      }

      <div class="card bg-base-200 border border-base-300">
        <div class="card-body py-4">
          <p class="font-semibold text-sm mb-1">To see it in action:</p>
          <p class="text-sm opacity-70">
            Open <strong>DevTools → Console tab</strong> (press F12), then interact with the cart on
            the SignalStore or Events pages. You'll see output like:
          </p>
          <pre
            class="bg-base-300 rounded p-3 text-xs mt-2 overflow-x-auto"
          ><code>[CART-STORE] state changed &#123; cartItems: [...] &#125;
[DEMO-API-STORE] state changed &#123; requestLoading: true &#125;</code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- withRequestStateAndErrorHandling -->
  <section class="card bg-base-100 shadow-xl border-2 border-accent">
    <div class="card-body space-y-4">
      <div>
        <h2 class="card-title text-2xl">
          <span class="badge badge-accent badge-lg">2</span>
          <code class="text-accent">withRequestStateAndErrorHandling</code>
        </h2>
        <p class="opacity-70 mt-1">
          Tracking whether an HTTP request is loading, succeeded, or failed is boilerplate you write
          in every project. This feature bundles it into one reusable piece.
        </p>
      </div>
      <p class="text-sm opacity-60">
        Returns a <code>handleRequest</code> operator — pipe any HTTP call through it. Uses
        <code>rxMethod</code>
        under the hood to handle async state automatically.
      </p>

      <button
        class="btn btn-ghost btn-sm w-fit gap-2 text-accent"
        (click)="withRequestStateOpen.set(!withRequestStateOpen())"
        [attr.aria-expanded]="withRequestStateOpen()"
      >
        {{ withRequestStateOpen() ? '▼' : '▶' }} View code — withRequestStateAndErrorHandling
      </button>
      @if (withRequestStateOpen()) {
      <pre
        class="bg-base-200 rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
      ><code>// Add to any store that makes HTTP calls (one line):
export const DemoApiStore = signalStore(
  withRequestStateAndErrorHandling(),  // ← adds loading/success/error state
  withState(&#123; users: [] &#125;),
  withMethods((store, http = inject(HttpClient)) => (&#123;
    loadUsers: rxMethod&lt;void&gt;(
      pipe(
        tap(() => store.setLoading()),
        switchMap(() =>
          http.get&lt;User[]&gt;('/api/users').pipe(
            store.handleRequest(&#123;
              next: (users) => patchState(store, &#123; users &#125;),
              error: (err) => console.error(err),
            &#125;)
          )
        )
      )
    ),
  &#125;)),
);</code></pre>
      }

      <h3 class="font-semibold text-lg">Live Demo</h3>
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
              } Load Users
            </button>
            <button
              class="btn btn-error"
              [class.btn-disabled]="store.requestLoading()"
              (click)="store.simulateError()"
            >
              @if (store.requestLoading()) {
              <span class="loading loading-spinner loading-sm"></span>
              } Simulate Error
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

      <div class="alert bg-base-200 border border-base-300">
        <span
          >💡 <strong>Key insight:</strong> One line to add to any store that makes HTTP calls.
          Loading, success, and error state — all handled.</span
        >
      </div>
    </div>
  </section>
</div>
```

- [ ] **Step 2: Open the app at `/custom-features` and verify**

Check:

- Page header shows subtitle
- Intro paragraph shows the "plugins for your store" analogy
- withLogger section has collapsible code showing both the feature definition and usage
- DevTools callout card renders with example console output
- withRequestState intro text is present
- withRequestState code toggle works
- Live demo (Load Users, Simulate Error, Reset) still works correctly
- Status badge updates: idle → loading → success/error
- Key insight callout appears at the bottom of the withRequestState section

- [ ] **Step 3: Commit**

```bash
git add src/app/features/custom-features/custom-features.component.html
git commit -m "feat: rewrite custom-features page with story flow and improved withLogger callout"
```
