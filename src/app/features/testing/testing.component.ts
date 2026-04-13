// src/app/features/testing/testing.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-testing-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">Testing</h1>
      <p class="text-lg opacity-70">
        If all logic lives in the store, the store is the only thing you need to test.
      </p>

      <!-- Intro -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="text-lg">
            The component just calls <code>inject(CartStore)</code> and binds to signals in the
            template. There is no logic in the component to test.
          </p>
        </div>
      </section>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- What you test -->
        <div>
          <h2 class="text-xl font-bold mb-4">What you test</h2>
          <div class="space-y-3">
            @for (test of tests; track test.name) {
              <div class="p-4 bg-base-200 rounded-lg border-l-4 border-success">
                <p class="font-mono text-sm font-bold">it('{{ test.name }}')</p>
                <p class="text-sm opacity-70 mt-1">{{ test.description }}</p>
              </div>
            }
          </div>
        </div>

        <!-- What you don't need -->
        <div>
          <h2 class="text-xl font-bold mb-4">What you don't need</h2>
          <ul class="space-y-3">
            @for (item of notNeeded; track item) {
              <li class="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                <span class="text-error font-bold text-lg leading-none" aria-hidden="true">✕</span>
                <span class="font-mono text-sm">{{ item }}</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Bottom card -->
      <section class="card border-2 border-success">
        <div class="card-body">
          <p class="text-center font-semibold text-lg">
            All your logic is in the store. Test the store — you have tested the feature.
          </p>
        </div>
      </section>
    </div>
  `,
})
export class TestingComponent {
  readonly tests = [
    {
      name: 'initial state is correct',
      description: 'State has 5 items, all with inCart: false. cartTotal is 0.',
    },
    {
      name: 'toggleInCart updates the right item',
      description: 'Only the targeted item flips inCart. All others stay unchanged.',
    },
    {
      name: 'cartTotal recomputes after toggle',
      description: 'The computed value updates automatically when an item is added to the cart.',
    },
  ];

  readonly notNeeded = [
    'TestBed',
    'Component fixture',
    'HTTP mocking for pure logic',
    'Spy on dispatch',
  ];
}
