// src/app/features/events/events.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { injectDispatch } from '@ngrx/signals/events';
import { CartItem, CartStore } from '../signal-store/store/cart.store';
import { NotificationStore } from '../signal-store/store/notification.store';
import { cartEvents } from '../signal-store/store/cart.events';

@Component({
  selector: 'app-events-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './events.component.html',
})
export class EventsComponent {
  readonly cartStore = inject(CartStore);
  readonly notificationStore = inject(NotificationStore);
  private readonly dispatch = injectDispatch(cartEvents);

  toggleItem(item: CartItem) {
    this.cartStore.toggleInCart(item.id);
    if (item.inCart) {
      this.dispatch.itemRemoved({ name: item.name });
    } else {
      this.dispatch.itemAdded({ name: item.name, price: item.price });
    }
  }
}
