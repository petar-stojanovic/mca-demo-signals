import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const cartEvents = eventGroup({
  source: 'Cart',
  events: {
    itemAdded: type<{ name: string; price: number }>(),
    itemRemoved: type<{ name: string }>(),
    cartCleared: type<void>(),
  },
});
