# Signal Store, Events & Custom Features — Presentation Redesign

**Date:** 2026-04-13  
**Scope:** Three pages: `/signal-store`, `/events`, `/custom-features`  
**Goal:** Simple, explanatory, visually pleasing — presentation-ready for ~100 people (mixed crowd)

---

## Context

The app is an Angular demo showcasing NgRx SignalStore. It uses Tailwind CSS + DaisyUI. The three pages already have working live demos and correct content. The redesign improves clarity and visual quality — it does not change any store logic or routing.

---

## Design Decisions

| Decision     | Choice                              | Reason                                                    |
| ------------ | ----------------------------------- | --------------------------------------------------------- |
| Layout feel  | Story flow                          | Sections build a narrative rather than listing features   |
| Code display | Collapsible toggle                  | Keeps pages clean; curious viewers can expand             |
| Audience     | Mixed crowd                         | Plain-language intros required, no NgRx knowledge assumed |
| Events page  | Flow diagram + live demo            | Visual makes the decoupling concept immediately clear     |
| withLogger   | Improved DevTools callout           | On-screen log panel not needed; clearer pointer suffices  |
| Structure    | Consistent feel, not rigid template | Each page adapts to its own content needs                 |

---

## Page Designs

### 1. Signal Store (`/signal-store`)

**Header**

- Title: `NgRx SignalStore`
- Subtitle: _"One file replaces four. State management built on Angular Signals."_
- Keep the existing Classic NgRx vs SignalStore comparison card — it's the hook.

**Section: withState**

- Plain-English intro: _"Define what your app needs to remember. Every property becomes a live signal automatically."_
- Collapsible code toggle showing `withState({ cartItems: [...] })`
- Keep existing product list demo

**Section: withComputed**

- Intro: _"Derived values that stay in sync — no manual recalculation."_
- Collapsible code showing the `computed()` inside `withComputed`
- Keep stats + cart list demo
- Key insight callout: _"These update automatically when the source signal changes."_

**Section: withMethods**

- Intro: _"All state changes go through one place. Components just call methods."_
- Collapsible code showing `toggleInCart`
- Keep Add/Remove buttons demo
- Key insight callout: _"Sections 1 and 2 above update reactively when you click."_

**Section: rxMethod**

- No live demo (kept as-is structurally)
- Rewrite explanation: _"A bridge between RxJS streams and your store — accepts a value, a signal, or an observable, and cleans up automatically."_
- Info alert pointing to Custom Features page stays

---

### 2. Events (`/events`)

**Header**

- Title: `Events`
- Subtitle: _"Think of events like announcements. Any part of the app can hear them — without knowing who else is listening."_

**Section: How it works**

- Replace badge list with a flow diagram:
  ```
  [Component] → dispatch(itemAdded) → [Event Bus] → [CartStore]
                                                   ↘ [NotificationStore]
  ```
- Below diagram: _"No direct connection between the stores. They only share the event definition."_
- Three concept pills (`eventGroup`, `withReducer`, `injectDispatch`) each get a one-line plain description:
  - `eventGroup` — defines the contract
  - `withReducer` — reacts to events
  - `injectDispatch` — fires events

**Section: Live Demo**

- Keeps existing structure (product list + two stores side by side)
- Clearer section intro: _"Toggle items below. Watch both stores react to the same events — independently."_
- CartStore and NotificationStore panels get clearer labels explaining what each one does

**Key insight callout**

- The existing bottom text ("Neither store knows about the other") promoted to a prominent callout card at the end of the page

---

### 3. Custom Features (`/custom-features`)

**Header**

- Title: `Custom Store Features`
- Subtitle: _"signalStoreFeature lets you package reusable store behavior and drop it into any store with one line."_

**Intro section**

- Replace vague paragraph with a concrete analogy: _"Think of these like plugins for your store. You write them once, then add them anywhere."_

**Section: withLogger**

- Rewrite to show the concrete one-liner:
  ```ts
  signalStore(
    withLogger('[MY-STORE]'),  // ← this is all you add
    withState(...)
  )
  ```
  (Inside collapsible)
- Improved DevTools callout: _"Open DevTools → Console tab, then interact with any page. You'll see `[CART-STORE] state changed { ... }` on every update."_

**Section: withRequestStateAndErrorHandling**

- Keep existing live demo (Load Users / Simulate Error / Reset) — it's the strongest demo on the page
- Add plain-English intro: _"Tracking whether an HTTP request is loading, succeeded, or failed is boilerplate you write in every project. This feature bundles it into one reusable piece."_
- Key insight callout: _"One line to add to any store that makes HTTP calls."_

---

## Implementation Notes

- All changes are HTML template changes only (`*.component.html` files), except:
  - The Events flow diagram is rendered with inline HTML/CSS in the template (no external lib needed)
  - Collapsible code toggles use Angular's `@if` with a local signal for open/closed state — requires small additions to the component `.ts` files
- No store logic changes
- No routing changes
- No new components needed — the collapsible toggle is inline per section
- The `withLogger` code example in the collapsible is a static code block (not live), just showing the API surface
