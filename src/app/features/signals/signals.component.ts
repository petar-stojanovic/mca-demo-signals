import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {
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
