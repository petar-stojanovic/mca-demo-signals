// src/app/features/testing/testing.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-testing-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto p-4 space-y-8">
      <h1 class="text-3xl font-bold">Testing</h1>
      <p class="text-lg opacity-70">
        All logic lives in the store. The store is the only thing you need to test.
      </p>

      <!-- Intro -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="text-lg">
            The component injects <code>CartStore</code> and binds signals in the template. There is
            no logic in the component to test — so we don't test it.
          </p>
        </div>
      </section>

      <!-- Real test spec -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body space-y-3">
          <h2 class="card-title text-xl">cart.store.spec.ts</h2>
          <p class="text-sm opacity-60">
            Provide the store, inject it, call methods, assert on signals. That's the whole pattern.
          </p>
          <pre
            class="rounded-lg p-4 text-sm overflow-x-auto leading-relaxed"
            style="background: #1e1e2e; color: #cdd6f4"
          ><code><span style="color:#cba6f7">describe</span>(<span style="color:#a6e3a1">'CartStore'</span>, () => &#123;
  <span style="color:#cba6f7">let</span> <span style="color:#89b4fa">store</span>: InstanceType&lt;<span style="color:#cba6f7">typeof</span> CartStore&gt;;

  <span style="color:#cba6f7">beforeEach</span>(() => &#123;
    <span style="color:#89b4fa">TestBed</span>.<span style="color:#89b4fa">configureTestingModule</span>(&#123;
      <span style="color:#89b4fa">providers</span>: [CartStore],
    &#125;);
    <span style="color:#89b4fa">store</span> = <span style="color:#89b4fa">TestBed</span>.<span style="color:#89b4fa">inject</span>(CartStore);
  &#125;);

  <span style="color:#cba6f7">it</span>(<span style="color:#a6e3a1">'initial state is correct'</span>, () => &#123;
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartItems</span>().<span style="color:#89b4fa">length</span>).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">5</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartTotal</span>()).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">0</span>);
  &#125;);

  <span style="color:#cba6f7">it</span>(<span style="color:#a6e3a1">'toggleInCart updates the right item'</span>, () => &#123;
    store.<span style="color:#89b4fa">toggleInCart</span>(<span style="color:#fab387">1</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartItems</span>()[<span style="color:#fab387">0</span>].<span style="color:#89b4fa">inCart</span>).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">true</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartItems</span>()[<span style="color:#fab387">1</span>].<span style="color:#89b4fa">inCart</span>).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">false</span>);
  &#125;);

  <span style="color:#cba6f7">it</span>(<span style="color:#a6e3a1">'cartTotal recomputes after toggle'</span>, () => &#123;
    store.<span style="color:#89b4fa">toggleInCart</span>(<span style="color:#fab387">1</span>);
    <span style="color:#cba6f7">expect</span>(store.<span style="color:#89b4fa">cartTotal</span>()).<span style="color:#89b4fa">toBe</span>(<span style="color:#fab387">59.99</span>);
  &#125;);
&#125;);</code></pre>
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
            @for (item of notNeeded; track item.label) {
              <li class="p-3 bg-base-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="text-error font-bold text-lg leading-none" aria-hidden="true"
                    >✕</span
                  >
                  <span class="font-mono text-sm">{{ item.label }}</span>
                </div>
                <p class="text-sm opacity-60 mt-1 ml-7">{{ item.reason }}</p>
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
    {
      label: 'TestBed (full module setup)',
      reason: 'You only need to provide CartStore — no component, no module, no declarations.',
    },
    {
      label: 'Component fixture',
      reason: 'The component has no logic to test. All behaviour is in the store.',
    },
    {
      label: 'HTTP mocking for pure logic',
      reason: 'toggleInCart is synchronous. No HTTP involved — no mock needed.',
    },
    {
      label: 'Spy on dispatch',
      reason:
        'Classic NgRx tests verify that store.dispatch(someAction) was called. ' +
        'SignalStore has no actions — you call a method and assert on the resulting signal value directly.',
    },
  ];
}
