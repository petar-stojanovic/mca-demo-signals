import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignalPrimitivesDemoComponent } from './components/signal-primitives-demo.component';
import { ConsoleLogCounterDemoComponent } from './components/console-log-counter-demo.component';
import { AsyncCounterDemoComponent } from './components/async-counter-demo.component';

@Component({
  selector: 'app-signals-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SignalPrimitivesDemoComponent,
    ConsoleLogCounterDemoComponent,
    AsyncCounterDemoComponent,
  ],
  templateUrl: './signals.component.html',
})
export class SignalsDemoComponent {}
