import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {
  // Legacy / Zone approach
  counter = 0;
  get doubleCounter() {
    console.log('Zone Check: Calculating doubleCounter');
    return this.counter * 2;
  }

  // Modern / Signal approach
  signalCount = signal(0);
  signalDouble = computed(() => {
    console.log('Signal Check: Calculating double');
    return this.signalCount() * 2;
  });

  incrementZone() {
    this.counter++;
  }

  incrementSignal() {
    this.signalCount.update((c) => c + 1);
  }
}
