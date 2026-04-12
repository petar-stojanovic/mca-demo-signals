import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { signalStore, withMethods, withState } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { delay, pipe, switchMap, tap } from 'rxjs';
import { withLogger } from '../signal-store/signal-store-features';
import { requestStateReset, withRequestStateAndErrorHandling } from './request-state.feature';
import { withDevtools } from '@angular-architects/ngrx-toolkit';

export type DemoUser = {
  id: number;
  name: string;
  email: string;
  company: { name: string };
};

export type DemoApiState = {
  users: DemoUser[];
};

const demoApiInitialState: DemoApiState = {
  users: [],
};

const API_URL = 'https://jsonplaceholder.typicode.com';

export const DemoApiStore = signalStore(
  { providedIn: 'root' },
  // withLogger('[DEMO-API-STORE]'),
  withDevtools('[DEMO-API-STORE]'),
  withRequestStateAndErrorHandling(),
  withState(demoApiInitialState),
  withMethods((store, http = inject(HttpClient)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => {
          store.setLoading();
          patchState(store, { users: [] });
        }),
        delay(5000),
        switchMap(() => {
          return http.get<DemoUser[]>(`${API_URL}/users`).pipe(
            store.handleRequest({
              next: (users) => patchState(store, { users }),
              error: (err: HttpErrorResponse) => console.error('Load failed:', err.message),
            }),
          );
        }),
      ),
    ),
    simulateError: rxMethod<void>(
      pipe(
        tap(() => {
          store.setLoading();
          patchState(store, { users: [] });
        }),
        delay(300),
        switchMap(() => {
          return http.get<unknown>(`${API_URL}/invalid-404`).pipe(
            store.handleRequest({
              next: () => {},
              error: (err: HttpErrorResponse) => console.error('Request failed:', err.message),
            }),
          );
        }),
      ),
    ),
    reset() {
      patchState(store, { users: [], ...requestStateReset() });
    },
  })),
);
