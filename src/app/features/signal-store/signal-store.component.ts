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

  toggleItem(item: CartItem) {
    this.store.toggleInCart(item.id);
  }

  onSearch(event: Event) {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }
}
