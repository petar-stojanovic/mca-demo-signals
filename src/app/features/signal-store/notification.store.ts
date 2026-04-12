import { signalStore, withState } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { cartEvents } from './shop.events';

type Notification = {
  id: number;
  message: string;
  timestamp: string;
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState({ notifications: [] as Notification[], nextId: 1 }),
  withReducer(
    on(cartEvents.itemAdded, ({ payload }, state) => ({
      notifications: [
        ...state.notifications,
        {
          id: state.nextId,
          message: `Added "${payload.name}" ($${payload.price})`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      nextId: state.nextId + 1,
    })),
    on(cartEvents.itemRemoved, ({ payload }, state) => ({
      notifications: [
        ...state.notifications,
        {
          id: state.nextId,
          message: `Removed "${payload.name}"`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      nextId: state.nextId + 1,
    })),
    on(cartEvents.cartCleared, () => ({
      notifications: [] as Notification[],
      nextId: 1,
    })),
  ),
);
