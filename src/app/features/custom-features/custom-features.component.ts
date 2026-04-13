import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DemoApiStore } from './demo-api.store';

@Component({
  selector: 'app-custom-features-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './custom-features.component.html',
})
export class CustomFeaturesComponent {
  readonly store = inject(DemoApiStore);

  readonly withLoggerOpen = signal(false);
  readonly withRequestStateOpen = signal(false);
}
