// src/app/layout/navbar.component.ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { injectDispatch } from '@ngrx/signals/events';
import { NotificationStore } from '../features/signal-store/store/notification.store';
import { cartEvents } from '../features/signal-store/store/cart.events';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
        @if (isCurrentPageEvents()) {
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
                    @for (
                      notification of notificationStore.notifications();
                      track notification.id
                    ) {
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
        }
      </div>
    </div>
  `,
})
export class NavbarComponent {
  readonly router = inject(Router);
  readonly notificationStore = inject(NotificationStore);
  readonly dispatch = injectDispatch(cartEvents);
  readonly navItems = NAV_ITEMS;

  clearNotifications() {
    this.dispatch.cartCleared();
  }

  private readonly currentUrl = toSignal(this.router.events.pipe(map(() => this.router.url)));

  protected isCurrentPageEvents = computed(() => {
    return this.currentUrl() === '/events';
  });
}
