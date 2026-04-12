# SignalStore Shop Demo — Design Spec

## Overview

A new demo page for a presentation about NgRx SignalStore. It follows the existing Zoneless and Signals pages as the third step in the narrative: Zoneless → Signals → SignalStore. The page uses a progressive top-to-bottom layout with three sections that build up the store concept step-by-step, each pairing a code snippet with live UI.

Based on Chris Perko's ng-conf SignalStore workshop (2:01–9:30 segment).

## Data Model

```typescript
type ShopItem = {
  id: number;
  name: string;
  price: number;
  inCart: boolean;
};
```

Hardcoded initial items (no API calls). ~4-5 products with varied prices.

## Files to Create

### `src/app/features/signal-store/shop.store.ts`

An NgRx SignalStore using `signalStore()` with `providedIn: 'root'`:

- **`withState`** — initial state: `{ items: ShopItem[] }` with hardcoded product data, all `inCart: false`
- **`withComputed`** — two derived signals:
  - `cartItems`: filtered items where `inCart === true`
  - `cartTotal`: sum of prices of cart items
- **`withMethods`** — one method:
  - `toggleInCart(itemId: number)`: uses `patchState` with immutable array update (map over items, flip `inCart` for matching id)

### `src/app/features/signal-store/signal-store.component.ts`

Standalone component with `ChangeDetectionStrategy.OnPush`. Injects `ShopStore`. Inline template.

Three progressive sections in a single-column layout:

**Section 1 — "Define State with `withState`"**

- Left: code snippet showing `withState({ items: [...] })`
- Right: live product list rendered via `@for`, showing name and price

**Section 2 — "Derive State with `withComputed`"**

- Left: code snippet showing `withComputed` with `cartItems` and `cartTotal`
- Right: live cart summary (item count + total price). Starts showing "Cart is empty"

**Section 3 — "Update State with `withMethods`"**

- Left: code snippet showing `withMethods` with `toggleInCart` using `patchState`
- Right: "Add to cart" / "Remove from cart" toggle buttons on each product

All three sections share the same store instance. Clicking buttons in section 3 reactively updates the cart display in section 2.

Code snippets are rendered as styled `<pre><code>` blocks (no external syntax highlighting library needed — use DaisyUI/Tailwind styling for a clean monospace look).

## Files to Modify

### `src/app/app.routes.ts`

Add lazy-loaded route:

```typescript
{ path: 'signal-store', loadComponent: () => import('./features/signal-store/signal-store.component').then(m => m.SignalStoreComponent) }
```

### `src/app/layout/navbar.component.ts`

Add "SignalStore" link to both desktop and mobile nav menus, pointing to `/signal-store`.

## Dependencies

Requires `@ngrx/signals` package to be installed.

## What's NOT in scope

- No `withHooks` / `onInit` lifecycle
- No custom store features
- No entities (`@ngrx/signals/entities`)
- No API calls or async operations
- No unit tests (presentation demo)
