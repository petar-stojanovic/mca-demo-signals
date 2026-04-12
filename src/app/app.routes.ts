import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'signals', pathMatch: 'full' },
  {
    path: 'zoneless',
    loadComponent: () =>
      import('./features/zoneless/zoneless.component').then((m) => m.ZonelessDemoComponent),
  },
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
    path: 'custom-features',
    loadComponent: () =>
      import('./features/custom-features/custom-features.component').then(
        (m) => m.CustomFeaturesComponent,
      ),
  },
];
