import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-async-counter-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen flex items-center justify-center">
      <div class="card w-full">
        <h2 class="card-title text-2xl mb-1">Async Updates</h2>
        <p class="text-sm opacity-60 mb-6">
          Both buttons wait <strong>1 second</strong> before updating. Without Zone.js,
          <code>setTimeout</code> no longer triggers change detection — so the plain property
          updates in memory but Angular never re-renders it. Signals notify Angular directly, so
          they always work.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Plain property -->
          <div class="p-4 border border-error rounded-lg bg-base-200">
            <h3 class="text-xl font-bold mb-2 text-error">Plain Property</h3>
            <div class="stats shadow w-full">
              <div class="stat">
                <div class="stat-title">Value</div>
                <div class="stat-value text-error">{{ traditionalValue }}</div>
              </div>
            </div>
            <button class="btn btn-error mt-4 text-white" (click)="updateTraditional()">
              Update (1s delay)
            </button>
            <p class="mt-2 text-xs opacity-60">
              Updates in memory, but Angular is never notified to re-render.
            </p>
          </div>
          <!-- Signal -->
          <div class="p-4 border-2 border-success rounded-lg bg-base-200">
            <h3 class="text-xl font-bold mb-2 text-success">Signal</h3>
            <div class="stats shadow w-full">
              <div class="stat">
                <div class="stat-title">Value</div>
                <div class="stat-value text-success">{{ signalValue() }}</div>
              </div>
            </div>
            <button class="btn btn-success mt-4 text-white" (click)="updateSignal()">
              Update (1s delay)
            </button>
            <p class="mt-2 text-xs opacity-60">Works — Angular tracks the signal.</p>
          </div>
        </div>
        <div class="mt-6">
          <button class="btn btn-outline btn-sm" (click)="forceCheck()">
            Force CDR Check — fixes the plain property
          </button>
        </div>
      </div>
    </section>
  `,
})
export class AsyncCounterDemoComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  traditionalValue = 0;
  signalValue = signal(0);

  updateTraditional() {
    setTimeout(() => {
      this.traditionalValue++;

      console.log('Traditional Value Updated: ', this.traditionalValue);
    }, 1000);
  }
  updateSignal() {
    setTimeout(() => {
      this.signalValue.update((v) => v + 1);

      console.log('Signal Value Updated: ', this.signalValue());
    }, 1000);
  }
  forceCheck() {
    this.cdr.detectChanges();
  }
}
