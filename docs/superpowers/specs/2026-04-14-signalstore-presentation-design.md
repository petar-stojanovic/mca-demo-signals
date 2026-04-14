# SignalStore Presentation — Design Spec

**Date:** 2026-04-14
**Scope:** `signal-store` page + `testing` page improvements

---

## Goals

- Make SignalStore the clear main topic of the presentation
- Improve the NgRx comparison so it works for both NgRx veterans and people who have never used it
- Add more and better code examples (including `withHooks` and `withEventHandlers`)
- Enhance the live demo to better show reactive data flow
- Fix the testing page layout and make "Spy on dispatch" understandable in context

---

## Audience

Mixed room: some attendees know Classic NgRx deeply, others have only heard the name.
The design must work for both without assuming prior NgRx knowledge.

---

## 1. SignalStore Page — "Why SignalStore?" Section

### Current state
A simple 2-column card: "Classic NgRx — 4 files" (bullet list) vs "SignalStore — 1 file" (bullet list).

### New design
Replace with a full **Classic NgRx vs SignalStore** side-by-side comparison panel.

**Left column — Classic NgRx (4 files):**
Each file is a collapsible code panel (collapsed by default) showing realistic NgRx code for the cart use case:
- `actions.ts` — `createAction` for `toggleInCart`
- `reducer.ts` — `createReducer` + `on()` handler
- `selectors.ts` — `createSelector` for `cartOnlyItems` and `cartTotal`
- `effects.ts` — `createEffect` listening to `loadProducts` action

**Right column — SignalStore (1 file):**
The equivalent `cart.store.ts` shown as a single collapsible panel.

**Concept mapping table** shown between the columns:

| NgRx file | SignalStore equivalent |
|---|---|
| `actions.ts` | `withMethods` (the intent) |
| `reducer.ts` | `withState` + `withMethods` (the state change) |
| `selectors.ts` | `withComputed` |
| `effects.ts` | `rxMethod` + `withEventHandlers` |

---

## 2. SignalStore Page — Per-Section NgRx Callouts

Each numbered `withX` section gets a small **"In Classic NgRx"** collapsible callout beneath the description. 2–3 lines of real NgRx code, labelled with the file it would live in (e.g. `// reducer.ts`). Collapsed by default.

### Sections (updated)

| # | Section | NgRx parallel |
|---|---|---|
| 1 | `withState` | `createReducer` initial state |
| 2 | `withComputed` | `createSelector` |
| 3 | `withMethods` | `createAction` + `on()` in reducer |
| 4 | `rxMethod` | `createEffect` with `switchMap` |
| 5 | `withHooks` *(new)* | Effect in constructor using `tap` |
| 6 | `withEventHandlers` *(new)* | Effect listening to a dispatched action |

**`withHooks` content:**
Shows `onInit` (e.g. logging or triggering a load) and `onDestroy` (cleanup). NgRx callout shows the constructor-injection pattern effects used.

**`withEventHandlers` content:**
Shows a notification side effect — when a cart item is added, emit a notification event. Explains: "Use this when you have side effects that should fire in response to store events, without coupling the method itself to the side effect."

---

## 3. Live Demo Enhancement (withMethods section)

Add a **search/filter input** above the product list.

### State changes to `cart.store.ts`

```ts
// withState — add:
searchQuery: ''

// withComputed — add:
filteredItems: computed(() =>
  cartItems().filter(item =>
    item.name.toLowerCase().includes(searchQuery().toLowerCase())
  )
)

// withMethods — add:
setSearchQuery(query: string) {
  patchState(store, { searchQuery: query });
}
```

### Why this is better
- `withComputed` now reacts to **two signals at once** — more convincing than a static filter
- The cart total stays correct regardless of which items are visible
- Audiences can type and watch the UI update with zero subscriptions

---

## 4. Testing Page — Full Replacement

### Current state
Two-column layout: "What you test" (named test descriptions) and "What you don't need" (bullet list). No code shown. "Spy on dispatch" appears without explanation.

### New design

**Top section:** Short intro — "All logic lives in the store. The store is the only thing you test."

**Main section:** Real `describe/it` test spec displayed as a syntax-highlighted code block:

```ts
describe('CartStore', () => {
  let store: InstanceType<typeof CartStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartStore],
    });
    store = TestBed.inject(CartStore);
  });

  it('initial state is correct', () => {
    expect(store.cartItems().length).toBe(5);
    expect(store.cartTotal()).toBe(0);
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
});
```

**"What you don't need" column** stays but each item gets a one-line contextual note:

| Item | Explanation |
|---|---|
| `TestBed` (full setup) | Only needed to provide the store — no component, no module |
| Component fixture | No component logic to test — it's all in the store |
| HTTP mocking for pure logic | Methods like `toggleInCart` are synchronous — no HTTP involved |
| Spy on dispatch | *Classic NgRx tests check that `store.dispatch(someAction)` was called. SignalStore has no actions — you call a method and assert on the resulting signal value directly.* |

**Bottom callout card** (kept):
> "All your logic is in the store. Test the store — you have tested the feature."

---

## Files to Change

| File | Change |
|---|---|
| `src/app/features/signal-store/signal-store.component.html` | Full rewrite — new comparison section, per-section NgRx callouts, new withHooks + withEventHandlers sections, search input in demo |
| `src/app/features/signal-store/signal-store.component.ts` | Add `searchQuery` input binding |
| `src/app/features/signal-store/store/cart.store.ts` | Add `searchQuery` state, `filteredItems` computed, `setSearchQuery` method |
| `src/app/features/testing/testing.component.ts` | Replace template — add real test code block, update "not needed" explanations |

---

## Out of Scope

- Routing changes
- New pages
- Changes to `signals`, `events`, or `custom-features` pages
- `withEventHandlers` live demo (shown as code only, not interactive)
