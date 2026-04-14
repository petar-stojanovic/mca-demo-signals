import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-signal-primitives-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen flex items-center justify-center">
      <div class="w-full max-w-5xl space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-bold">Signals</h2>
          <p>
            A signal is a wrapper around a value that notifies interested consumers when that value
            changes.
          </p>
          <p>Signals can contain any value, from primitives to complex data structures.</p>

          <hr class="mt-5 opacity-10" />

          <p class="opacity-70">
            All three share the same <code>count</code> signal — increment it and watch each one
            react.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- signal() -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body gap-4">
              <h3 class="card-title text-xl">
                <code class="text-primary">signal()</code>
              </h3>
              <ul class="text-sm opacity-70 space-y-1">
                <li>Holds a value</li>
                <li>
                  countSignal = <code class="badge badge-soft badge-sm px-2">signal(0);</code>
                </li>
                <li>Read it: <code class="badge badge-soft badge-sm px-2">countSignal()</code></li>
                <li>
                  Change it: <code class="badge badge-soft badge-sm px-2">.set()</code> or
                  <code class="badge badge-soft badge-sm px-2">.update()</code>
                </li>
                <li>Angular updates the UI automatically</li>
              </ul>
              <div class="stats shadow w-full">
                <div class="stat">
                  <div class="stat-title">count</div>
                  <div class="stat-value text-primary">{{ countSignal() }}</div>
                </div>
              </div>
              <button class="btn btn-primary btn-sm w-full font-mono" (click)="increment()">
                countSignal.update(c => c + 1)
              </button>
              <button class="btn btn-outline btn-sm w-full font-mono" (click)="setRandom()">
                countSignal.set(random)
              </button>
            </div>
          </div>

          <!-- computed() -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body gap-4">
              <h3 class="card-title text-xl">
                <code class="text-secondary">computed()</code>
              </h3>
              <ul class="text-sm opacity-70 space-y-1">
                <li>Derives a value from other signals</li>
                <li>
                  <span class="badge badge-sm badge-soft px-2">Read-only</span> - you can't set it
                  directly
                </li>
                <li>Recalculates only when dependencies change</li>
                <li>Never stale, never over-computes</li>
              </ul>
              <div class="stats shadow w-full">
                <div class="stat">
                  <div class="stat-title">doubled = count × 2</div>
                  <div class="stat-value text-secondary">{{ doubledNumber() }}</div>
                </div>
              </div>
              <p class="text-xs opacity-50 font-mono text-center">computed(() => count() * 2)</p>
            </div>
          </div>

          <!-- effect() -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body gap-4">
              <h3 class="card-title text-xl">
                <code class="text-accent">effect()</code>
              </h3>
              <ul class="text-sm opacity-70 space-y-1">
                <li>Runs code when a signal changes</li>
                <li>
                  Best used for:
                  <span class="badge badge-sm badge-soft px-2">logging </span>
                  <span class="badge badge-sm badge-soft px-2">localStorage </span>
                  <span class="badge badge-sm badge-soft px-2">analytics </span>
                </li>
                <li>Not for updating other signals</li>
                <li>Cleans up automatically on destroy</li>
                <li class="font-semibold badge badge-soft  badge-error">
                  Angular docs: "use effect() carefully"
                </li>
              </ul>
              <div class="bg-base-200 rounded-lg p-3 h-28 overflow-y-auto space-y-1">
                @if (effectLog().length === 0) {
                  <p class="text-xs opacity-40 italic">Waiting for changes…</p>
                }
                @for (entry of effectLog(); track $index) {
                  <p class="text-xs font-mono">{{ entry }}</p>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button class="btn btn-outline btn-sm" (click)="reset()">Reset</button>
        </div>
      </div>
    </section>
  `,
})
export class SignalPrimitivesDemoComponent {
  readonly countSignal = signal(0);

  readonly doubledNumber = computed(() => {
    return this.countSignal() * 2;
  });

  readonly effectLog = signal<string[]>([]);

  private readonly effectExample = effect(() => {
    // reads count — tracked
    const count = this.countSignal();

    // writes effectLog — not tracked
    this.effectLog.update((log) => [...log, `count changed → ${count}`]);
  });

  increment() {
    // this.countSignal.set(this.countSignal() + 1);
    this.countSignal.update((c) => c + 1);
  }

  setRandom() {
    this.countSignal.set(Math.floor(Math.random() * 100) + 1);
  }

  reset() {
    this.countSignal.set(0);
    this.effectLog.set([]);
  }
}
