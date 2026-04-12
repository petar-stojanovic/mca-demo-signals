// src/app/features/signals/signals.component.ts
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  // Sync counter — zone counter won't update without Zone.js
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

  traditionalValue = 0;
  updateTraditional() {
    setTimeout(() => {
      this.traditionalValue++;
    }, 1000);
  }

  signalValue = signal(0);
  updateSignal() {
    setTimeout(() => {
      this.signalValue.update((v) => v + 1);
    }, 1000);
  }

  forceCheck() {
    this.cdr.detectChanges();
  }
}
