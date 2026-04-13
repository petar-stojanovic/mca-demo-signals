import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-console-log-counter-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-[calc(100vh-10rem)] flex items-center justify-center">
      <div class="card">
        <h2 class="card-title text-2xl mb-6">Open Console and see the logs</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Zone side -->
          <div class="p-4 border rounded-lg bg-base-200">
            <h3 class="card-subtitle font-bold mb-2">Zone Counter</h3>
            <div class="stats shadow w-full">
              <div class="stat">
                <div class="stat-title">Counter</div>
                <div class="stat-value">{{ counter }}</div>
                <div class="stat-desc text-lg">Double: {{ doubleCounter }}</div>
              </div>
            </div>
            <button class="btn btn-primary mt-4" (click)="incrementZone()">Increment</button>
          </div>

          <!-- Signal side -->
          <div class="p-4 border-2 border-primary rounded-lg bg-base-200">
            <h3 class="card-subtitle font-bold mb-2 text-primary">Signal Counter</h3>
            <div class="stats shadow w-full">
              <div class="stat">
                <div class="stat-title">Signal Count</div>
                <div class="stat-value">{{ signalCounter() }}</div>
                <div class="stat-desc text-lg">Computed Double: {{ signalDoubleCounter() }}</div>
              </div>
            </div>
            <div role="note" class="alert alert-info mt-4 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Change detection re-runs every expression in the component — not just the ones
                related to what changed. With signals, Angular knows exactly which bindings to skip.
              </span>
            </div>
            <button class="btn btn-accent mt-4" (click)="incrementSignal()">Increment</button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ConsoleLogCounterDemoComponent {
  counter = 0;
  get doubleCounter() {
    console.log('Zone Check: Calculating doubleCounter');
    return this.counter * 2;
  }

  signalCounter = signal(0);
  signalDoubleCounter = computed(() => {
    console.log('Signal Check: Calculating signalDoubleCounter');
    return this.signalCounter() * 2;
  });

  incrementZone() {
    this.counter++;
  }

  incrementSignal() {
    this.signalCounter.update((c) => c + 1);
  }
}
