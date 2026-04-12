import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoApiStore } from './demo-api.store';

@Component({
  selector: 'app-custom-features-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-8xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">Custom Store Features</h1>
      <p class="text-lg opacity-70">
        Extract reusable store logic into composable
        <code>signalStoreFeature</code> functions — plug and play.
      </p>

      <!-- Section 1: withLogger -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-primary badge-lg">1</span>
            <code class="text-primary">withLogger</code>
          </h2>
          <p class="opacity-70">
            Logs every state change to the console. One line to add to any store. Open DevTools
            console and interact with the demo below to see it in action.
          </p>
        </div>
      </section>

      <!-- Section 2: rxMethod -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-secondary badge-lg">2</span>
            <code class="text-secondary">rxMethod</code>
          </h2>
          <p class="opacity-70 mb-4">
            Bridges RxJS and SignalStore. Accepts a static value, a signal, or an observable —
            auto-subscribes, auto-unsubscribes on destroy. No manual <code>.subscribe()</code>.
          </p>
          <div class="p-4 bg-base-200 rounded-lg">
            <ul class="list-disc list-inside text-sm space-y-1 opacity-70">
              <li>No <code>.subscribe()</code> — no memory leaks</li>
              <li>Accepts signals directly — reactive by default</li>
              <li>Cleaned up automatically when the store is destroyed</li>
              <li>Pairs with <code>switchMap</code> / <code>exhaustMap</code> for cancellation</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Section 3: withRequestStateAndErrorHandling — Live Demo -->
      <section class="card bg-base-100 shadow-xl border-2 border-accent">
        <div class="card-body">
          <h2 class="card-title text-2xl">
            <span class="badge badge-accent badge-lg">3</span>
            <code class="text-accent">withRequestStateAndErrorHandling</code>
          </h2>
          <p class="opacity-70 mb-4">
            Tracks loading, success, and error for API calls. Returns an RxJS
            <code>handleRequest</code> operator — pipe any HTTP call through it.
          </p>

          <!-- Live Demo -->
          <h3 class="font-semibold text-lg mb-3">Live Demo</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Controls + State -->
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <button
                  class="btn btn-primary"
                  [class.btn-disabled]="store.requestLoading()"
                  (click)="store.loadUsers()"
                >
                  @if (store.requestLoading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Load Users
                </button>
                <button
                  class="btn btn-error"
                  [class.btn-disabled]="store.requestLoading()"
                  (click)="store.simulateError()"
                >
                  @if (store.requestLoading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Simulate Error
                </button>
                <button class="btn btn-ghost" (click)="store.reset()">Reset</button>
              </div>

              <!-- Status indicator -->
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

            <!-- Results table -->
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
        </div>
      </section>
    </div>
  `,
  styles: `
    code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f4f4f4;
      color: #c7254e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 1rem;
      line-height: 1.4;
    }
  `,
})
export class CustomFeaturesComponent {
  readonly store = inject(DemoApiStore);
}
