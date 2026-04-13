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
