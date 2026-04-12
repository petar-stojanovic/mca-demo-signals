import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  untracked,
} from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {
  // Legacy / Zone approach
  counter = 0;
  zoneEvalCount = 0;
  get doubleCounter() {
    console.log('Zone Check: Calculating doubleCounter');
    this.zoneEvalCount++;
    return this.counter * 2;
  }

  // Modern / Signal approach
  signalCount = signal(0);
  signalComputeCount = signal(0);
  signalDouble = computed(() => {
    console.log('Signal Check: Calculating double');
    return this.signalCount() * 2;
  });

  constructor() {
    effect(() => {
      this.signalDouble();
      untracked(() => this.signalComputeCount.update((c) => c + 1));
    });
  }

  incrementZone() {
    this.counter++;
  }

  incrementSignal() {
    this.signalCount.update((c) => c + 1);
  }
}
