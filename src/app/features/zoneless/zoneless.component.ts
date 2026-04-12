import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zoneless-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './zoneless.component.html',
})
export class ZonelessDemoComponent {
  private cdr = inject(ChangeDetectorRef);

  traditionalValue = 0;
  updateTraditional() {
    setTimeout(() => {
      this.traditionalValue++;
      console.log('Updated traditional value to:', this.traditionalValue);
      // In Zoneless, this won't reflect in UI unless we call cdr.markForCheck()
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
