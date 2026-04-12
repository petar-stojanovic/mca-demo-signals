import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignalPrimitivesDemoComponent } from './components/signal-primitives-demo.component';
import { SyncCounterDemoComponent } from './components/sync-counter-demo.component';
import { AsyncCounterDemoComponent } from './components/async-counter-demo.component';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SignalPrimitivesDemoComponent, SyncCounterDemoComponent, AsyncCounterDemoComponent],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {}
