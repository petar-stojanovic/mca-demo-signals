import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let store: InstanceType<typeof CartStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CartStore] });
    store = TestBed.inject(CartStore);
  });

  it('initial state is correct', () => {
    expect(store.cartItems().length).toBe(5);
    expect(store.cartTotal()).toBe(0);
    expect(store.searchQuery()).toBe('');
  });

  it('toggleInCart updates the right item', () => {
    store.toggleInCart(1);
    expect(store.cartItems()[0].inCart).toBe(true);
    expect(store.cartItems()[1].inCart).toBe(false);
  });

  it('cartTotal recomputes after toggle', () => {
    store.toggleInCart(1);
    expect(store.cartTotal()).toBe(59.99);
  });

  it('setSearchQuery filters items by name (case-insensitive)', () => {
    store.setSearchQuery('keyboard');
    expect(store.filteredItems().length).toBe(1);
    expect(store.filteredItems()[0].name).toBe('Mechanical Keyboard');
  });

  it('filteredItems returns all items when search is empty', () => {
    store.setSearchQuery('');
    expect(store.filteredItems().length).toBe(5);
  });

  it('filteredItems preserves cart state when filtering', () => {
    store.toggleInCart(2); // Mechanical Keyboard
    store.setSearchQuery('keyboard');
    expect(store.filteredItems()[0].inCart).toBe(true);
  });
});
