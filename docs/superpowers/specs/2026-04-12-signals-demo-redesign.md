# Signals Demo App Redesign

**Date:** 2026-04-12  
**Goal:** Improve the interactive presentation app for Angular Signals & SignalStore — cleaner narrative flow, no inline code snippets, junior-friendly language.

---

## Summary of Changes

- Merge `/zoneless` and `/signals` into one page
- Remove all inline code snippets from the UI (IDE will be used for code during pr[2026-04-12-signals-demo-redesign.md](../plans/2026-04-12-signals-demo-redesign.md)esentation)
- Split SignalStore content into dedicated pages: core, events, testing, custom features
- Add `rxMethod` to the SignalStore core page as a 4th built-in section
- rxMethod section on SignalStore page is concept-only (no live demo moved)
- All text: short, simple, junior-friendly

---

## Page Structure

| #   | Route              | Nav Label          | One-line purpose                                                     |
| --- | ------------------ | ------------------ | -------------------------------------------------------------------- |
| 1   | `/signals`         | Signals & Zoneless | Change detection story + live demos                                  |
| 2   | `/signal-store`    | SignalStore        | Core building blocks: withState, withComputed, withMethods, rxMethod |
| 3   | `/events`          | Events             | Decoupled store communication via eventGroup + withReducer           |
| 4   | `/testing`         | Testing            | The store is the unit under test                                     |
| 5   | `/custom-features` | Custom Features    | signalStoreFeature: withLogger + withRequestStateAndErrorHandling    |

**Deleted:** `/zoneless` route and `ZonelessDemoComponent`

---

## Page 1 — Signals & Zoneless

**Thesis:** Zone.js told Angular _when_ to check. Signals tell Angular _what_ changed.

### Act 1 — Change Detection Evolution

- Hero: one-line intro
- 3 cards with GIFs: Default CD → OnPush → Signals
- Keep existing content, no changes needed

### Act 2 — Live Demos (merged from zoneless page)

- **Zoneless counter demo:** Zone counter stays frozen (no Zone.js to trigger CD), signal counter updates — "See it yourself"
- **Async timeout demo** (from current ZonelessDemoComponent): traditional plain property update after 1s delay → UI doesn't change. Signal update after 1s delay → UI updates. "Force CDR Check" button stays — good talking point.

### Implementation notes

- Merge `ZonelessDemoComponent` logic into `SignalsDemoComponent`
- Delete `zoneless.component.ts` and `zoneless.component.html`
- Remove `/zoneless` route

---

## Page 2 — SignalStore

**Thesis:** One file. One API. Everything in the store.

### Intro

- Two-column text comparison: Classic NgRx (4 files: actions, reducer, selectors, effects) vs SignalStore (1 file). Text only, no code.

### Section 1 — withState

- Short description: "Your state shape. Each property becomes a signal automatically."
- Live: product list rendered from store state

### Section 2 — withComputed

- Short description: "Derived values. Always in sync. Recalculate only when source changes."
- Live: cart summary (item count + total) — updates reactively as user interacts in Section 3

### Section 3 — withMethods

- Short description: "All state changes go through the store. Components just call methods."
- Live: toggle buttons to add/remove items — drives Sections 1 and 2 reactively

### Section 4 — rxMethod

- Label: "Built-in SignalStore tool — not something you write."
- Short description: "Connects RxJS streams to your store. Accepts a value, a signal, or an observable."
- Three concept pills: "No `.subscribe()`", "Reactive by default", "Auto-cleanup on destroy"
- No live demo here — the DemoApiStore demo on Custom Features page shows rxMethod in action. Reference that: "You'll see this in action on the Custom Features page."

### Implementation notes

- Remove all `mockup-code` blocks and code string properties from `SignalStoreComponent`

---

## Page 3 — Events

**Thesis:** Events decouple _what happened_ from _how state changes_.

### Intro card

- "An event is just a fact — `itemAdded`, `itemRemoved`. Any store can listen. No coupling between stores."
- Two concept pills: "`eventGroup` defines the contract", "`withReducer` reacts to it"

### Live demo

- Cart toggle buttons (dispatch events on click)
- Two labeled live state boxes side by side: `CartStore` state and `NotificationStore` state — both update in real time from the same events
- Notification bell in navbar lights up

### Key point card

- "Neither store knows about the other. They only share the event definition."

### Implementation notes

- Extract events section from `SignalStoreComponent` into a new `EventsComponent`
- New route `/events` added to `app.routes.ts`
- New nav item added to `NavbarComponent`

---

## Page 4 — Testing

**Thesis:** If all logic lives in the store, the store is the only thing you need to test.

### Intro card

- "The component just calls `inject(CartStore)` and binds to signals in the template. There's no logic in the component to test."

### Two-column layout

**Left — "What you test" (rendered spec skeleton)**  
Three styled cards (not code blocks) — each shows a test name + one-line description:

1. `'initial state is correct'` — state shape matches the initial value
2. `'toggleInCart updates the right item'` — only the targeted item flips inCart
3. `'cartTotal recomputes after toggle'` — computed value stays in sync

**Right — "What you don't need"**  
Checklist:

- No `TestBed`
- No component fixture
- No HTTP mocking for pure logic
- No spy on dispatch

### Bottom card

- "All your logic is in the store. Test the store — you've tested the feature."

### Implementation notes

- New `TestingComponent` with route `/testing`
- New nav item added to `NavbarComponent`
- No store injection needed — this page is purely presentational

---

## Page 5 — Custom Features

**Thesis:** `signalStoreFeature` lets you extract reusable store behavior — one line to add it to any store.

### Intro card

- "These are features you write yourself. Not built-in to SignalStore, but built the same way. Drop them into any store."

### Section 1 — withLogger

- Short description: "Logs every state change to the console. One line to add to any store."
- Instruction: "Open DevTools console and interact with the previous pages to see it in action."
- No live demo needed — the console is the demo

### Section 2 — withRequestStateAndErrorHandling

- Short description: "Tracks loading, success, and error state for any HTTP call. Returns a `handleRequest` operator — pipe any request through it."
- Live demo: Load Users / Simulate Error / Reset + status badge + results table (existing demo, kept here)

### Implementation notes

- Remove code snippets from `CustomFeaturesComponent`
- Remove rxMethod section (moved to SignalStore page as concept-only)
- Keep `DemoApiStore` live demo on this page

---

## What Does NOT Change

- `CartStore`, `NotificationStore`, `cart.events.ts`, `withLogger`, `withRequestStateAndErrorHandling`, `DemoApiStore` — no logic changes
- DaisyUI layout, color scheme, navbar
- Notification bell behavior
- All existing live interactive demos
