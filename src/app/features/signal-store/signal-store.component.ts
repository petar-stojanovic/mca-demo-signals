import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { injectDispatch } from '@ngrx/signals/events';
import { CartItem, CartStore } from './store/cart.store';
import { cartEvents } from './store/cart.events';

@Component({
  selector: 'app-signal-store-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './signal-store.component.html',
})
export class SignalStoreComponent {
  readonly store = inject(CartStore);

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
  }
}
