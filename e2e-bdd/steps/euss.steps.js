import { createBdd } from 'playwright-bdd';
import { test } from './bdd-fixtures';

const { Given, When, Then } = createBdd(test);

Given('I open the EUSS web messenger', async ({ eussPage }) => {
  await eussPage.openHome();
});

Given('I open an invalid EUSS page', async ({ eussPage }) => {
  await eussPage.openInvalidPage();
});

Given('I dismiss cookies by accepting', async ({ eussPage }) => {
  await eussPage.dismissCookiesByAccepting();
});

Then('I should see the EUSS messenger heading', async ({ eussPage }) => {
  await eussPage.expectHeading();
});

Then('I should see cookie banner action controls', async ({ eussPage }) => {
  await eussPage.expectCookieBannerControls();
});

When('I accept analytics cookies', async ({ eussPage }) => {
  await eussPage.acceptCookies();
});

When('I reject analytics cookies', async ({ eussPage }) => {
  await eussPage.rejectCookies();
});

When('I hide the cookie acceptance message', async ({ eussPage }) => {
  await eussPage.hideCookieMessage();
});

Then('cookie action buttons should no longer be visible', async ({ eussPage }) => {
  await eussPage.expectCookieActionButtonsHidden();
});

Then('I should see the hide cookie message button', async ({ eussPage }) => {
  await eussPage.expectHideCookieMessageVisible();
});

Then('I should not see the hide cookie message button', async ({ eussPage }) => {
  await eussPage.expectHideCookieMessageHidden();
});

Then('I should see the page not found heading', async ({ eussPage }) => {
  await eussPage.expectNotFoundHeading();
});

Then('I should see chat controls', async ({ eussPage }) => {
  await eussPage.expectChatControlsVisible();
});

When('I send the message {string}', async ({ eussPage }, message) => {
  await eussPage.sendMessage(message);
});

Then('I should see my message {string}', async ({ eussPage }, message) => {
  await eussPage.expectUserMessageVisible(message);
});

Then('I should see message metadata prefixed with {string}', async ({ eussPage }, prefix) => {
  await eussPage.expectMessageMetadataPrefix(prefix);
});

Then('I should receive one more assistant response', async ({ eussPage }) => {
  await eussPage.expectAssistantResponseIncreased();
});

When('I open the end chat dialog', async ({ eussPage }) => {
  await eussPage.openEndChatDialog();
});

Then('I should see end chat confirmation controls', async ({ eussPage }) => {
  await eussPage.expectEndChatDialog();
});

When('I choose to keep chatting', async ({ eussPage }) => {
  await eussPage.keepChatting();
});

When('I confirm ending the chat', async ({ eussPage }) => {
  await eussPage.confirmEndChat();
});

Then('I should see the chat ended page', async ({ eussPage }) => {
  await eussPage.expectChatEndedPage();
});

Then('I should not see chat input or message history', async ({ eussPage }) => {
  await eussPage.expectChatCleared();
});

When('I fill the input with {int} characters of {string}', async ({ eussPage }, count, character) => {
  await eussPage.fillInputWithRepeatedCharacters(count, character);
});

When('I send the current message', async ({ eussPage }) => {
  await eussPage.sendCurrentMessage();
});

Then('I should see character counter text {string}', async ({ eussPage }, text) => {
  await eussPage.expectCharacterCounterText(text);
});

Then('the input should be clamped to {int} characters of {string}', async ({ eussPage }, count, character) => {
  await eussPage.expectInputClampedToCount(count, character);
});

Then('the send button should be enabled', async ({ eussPage }) => {
  await eussPage.expectSendButtonEnabled();
});

When('I open the accessibility statement from the footer', async ({ eussPage }) => {
  await eussPage.openAccessibilityFromFooter();
});

Then('I should see the EUSS accessibility statement', async ({ eussPage }) => {
  await eussPage.expectAccessibilityStatement();
});

When('I open the cookies page from the footer', async ({ eussPage }) => {
  await eussPage.openCookiesFromFooter();
});

Then('I should see the cookies page', async ({ eussPage }) => {
  await eussPage.expectCookiesPage();
});

When('I navigate back in the browser', async ({ eussPage }) => {
  await eussPage.navigateBack();
});

Then('I should see chat input', async ({ eussPage }) => {
  await eussPage.expectChatInputVisible();
});

When('I send {int} sequential messages with prefix {string}', async ({ eussPage }, count, prefix) => {
  await eussPage.sendSequentialMessages(count, prefix);
});

When('I refresh the page', async ({ eussPage }) => {
  await eussPage.refreshPage();
});

When('I send the next sequential message with prefix {string}', async ({ eussPage }, prefix) => {
  eussPage.sequentialPrefix = prefix;
  await eussPage.sendNextSequentialMessage();
});

Then('I should observe one more inbound message after refresh', async () => {
  // Verified inside sendNextSequentialMessage with poll + assertion.
});
