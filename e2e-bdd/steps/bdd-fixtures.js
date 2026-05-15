import { test as base } from 'playwright-bdd';
import { EussMessengerPage } from '../pages/euss-messenger-page';

export const test = base.extend({
  eussPage: async ({ page }, useFixture) => {
    await useFixture(new EussMessengerPage(page));
  }
});
