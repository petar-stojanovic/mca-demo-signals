// src/app/features/custom-features/custom-features.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoApiStore } from './demo-api.store';

@Component({
  selector: 'app-custom-features-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './custom-features.component.html',
})
export class CustomFeaturesComponent {
  readonly store = inject(DemoApiStore);
}
