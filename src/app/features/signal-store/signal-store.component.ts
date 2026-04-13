import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartItem, CartStore } from './store/cart.store';

@Component({
  selector: 'app-signal-store-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './signal-store.component.html',
})
export class SignalStoreComponent {
  readonly store = inject(CartStore);

  readonly withStateOpen = signal(false);
  readonly withComputedOpen = signal(false);
  readonly withMethodsOpen = signal(false);
  readonly rxMethodOpen = signal(false);

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
  }
}
