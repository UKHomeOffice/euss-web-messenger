import { expect } from '@playwright/test';

export class EussMessengerPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      acceptCookies: '#cookies-accept',
      rejectCookies: '#cookies-reject',
      hideCookiesMessage: '#hide-accept-message',
      viewCookiesLink: 'a:has-text("View cookies")',
      messageInput: '[data-testid="message-input"]',
      sendButton: '[data-testid="send-message-button"]',
      endChatButton: '[data-testid="end-chat-button"]',
      inboundMessageWrapper: '[data-testid="inbound-message-wrapper"]',
      outboundMessageWrapper: '[data-testid="outbound-message-wrapper"]',
      messageMetadata: '[data-testid="message-metadata"]',
      endChatModal: '[data-testid="end-chat-modal"]',
      closeEndChatButton: '[data-testid="close-end-chat-modal-button"]',
      confirmEndChatButton: '[data-testid="confirm-end-chat-button"]',
      characterCounter: '[data-testid="character-counter"]'
    };

    this.lastOutboundCount = 0;
    this.lastInboundCountAfterRefresh = 0;
    this.sequentialMessageIndex = 0;
    this.sequentialPrefix = '';
  }

  async openHome() {
    await this.page.goto('/');
  }

  async openInvalidPage() {
    await this.page.goto('/invalid-path-for-euss');
  }

  async expectHeading() {
    await expect(this.page.getByRole('heading', { name: 'Home Office EUSS Chat' })).toBeVisible();
  }

  async expectCookieBannerControls() {
    await expect(this.page.locator(this.selectors.acceptCookies)).toBeVisible();
    await expect(this.page.locator(this.selectors.rejectCookies)).toBeVisible();
    await expect(this.page.locator(this.selectors.viewCookiesLink)).toBeVisible();
  }

  async acceptCookies() {
    await this.page.locator(this.selectors.acceptCookies).click();
  }

  async rejectCookies() {
    await this.page.locator(this.selectors.rejectCookies).click();
  }

  async hideCookieMessage() {
    await this.page.locator(this.selectors.hideCookiesMessage).click();
  }

  async expectCookieActionButtonsHidden() {
    await expect(this.page.locator(this.selectors.acceptCookies)).toHaveCount(0);
    await expect(this.page.locator(this.selectors.rejectCookies)).toHaveCount(0);
  }

  async expectHideCookieMessageVisible() {
    await expect(this.page.locator(this.selectors.hideCookiesMessage)).toBeVisible();
  }

  async expectHideCookieMessageHidden() {
    await expect(this.page.locator(this.selectors.hideCookiesMessage)).toHaveCount(0);
  }

  async dismissCookiesByAccepting() {
    await this.expectCookieBannerControls();
    await this.acceptCookies();
    await this.expectCookieActionButtonsHidden();
    await this.expectHideCookieMessageVisible();
    await this.hideCookieMessage();
    await this.expectHideCookieMessageHidden();
  }

  async expectNotFoundHeading() {
    await expect(this.page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  }

  async expectChatControlsVisible() {
    await expect(this.page.locator(this.selectors.messageInput)).toBeVisible();
    await expect(this.page.locator(this.selectors.sendButton)).toBeVisible();
    await expect(this.page.locator(this.selectors.endChatButton)).toBeVisible();
  }

  async sendMessage(text) {
    this.lastOutboundCount = await this.page.locator(this.selectors.outboundMessageWrapper).count();
    await this.page.locator(this.selectors.messageInput).fill(text);
    await this.page.locator(this.selectors.sendButton).click();
  }

  async expectUserMessageVisible(text) {
    await expect(this.page.locator(this.selectors.inboundMessageWrapper).filter({ hasText: text }).first()).toBeVisible();
  }

  async expectMessageMetadataPrefix(prefix) {
    const metadata = this.page.locator(this.selectors.messageMetadata).filter({ hasText: prefix });
    await expect(metadata.first()).toBeVisible();
    await expect(metadata.first()).toContainText(/\d{2}:\d{2}/);
  }

  async expectAssistantResponseIncreased() {
    await expect.poll(async () => this.page.locator(this.selectors.outboundMessageWrapper).count(), {
      timeout: 30_000,
      intervals: [500, 1000, 2000]
    }).toBeGreaterThan(this.lastOutboundCount);
  }

  async openEndChatDialog() {
    await this.page.locator(this.selectors.endChatButton).click();
  }

  async expectEndChatDialog() {
    await expect(this.page.locator(this.selectors.endChatModal)).toBeVisible();
    await expect(this.page.getByTestId('end-chat-modal-heading')).toContainText('Do you want to end the chat?');
    await expect(this.page.getByRole('button', { name: 'Yes, end chat' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'No, keep chatting' })).toBeVisible();
  }

  async keepChatting() {
    await this.page.locator(this.selectors.closeEndChatButton).click();
  }

  async confirmEndChat() {
    await this.page.locator(this.selectors.confirmEndChatButton).click();
  }

  async expectChatEndedPage() {
    await expect(this.page.getByRole('heading', { name: 'Your chat has ended' })).toBeVisible();
  }

  async expectChatCleared() {
    await expect(this.page.locator(this.selectors.messageInput)).toHaveCount(0);
    await expect(this.page.locator(this.selectors.inboundMessageWrapper)).toHaveCount(0);
  }

  async fillInputWithRepeatedCharacters(count, character) {
    await this.page.locator(this.selectors.messageInput).fill(character.repeat(count));
  }

  async sendCurrentMessage() {
    await this.page.locator(this.selectors.sendButton).click();
  }

  async expectCharacterCounterText(text) {
    await expect(this.page.locator(this.selectors.characterCounter)).toContainText(text);
  }

  async expectInputClampedToCount(count, character) {
    await expect(this.page.locator(this.selectors.messageInput)).toHaveValue(character.repeat(count));
  }

  async expectSendButtonEnabled() {
    await expect(this.page.locator(this.selectors.sendButton)).toBeEnabled();
  }

  async openAccessibilityFromFooter() {
    await this.page.getByTestId('footer-accessibilty-statement-link').click();
  }

  async expectAccessibilityStatement() {
    await expect(this.page).toHaveURL(/\/accessibility$/);
    await expect(
      this.page.getByRole('heading', {
        name: 'Accessibility statement for the EUSS (EU Settlement Service)'
      })
    ).toBeVisible();
  }

  async openCookiesFromFooter() {
    await this.page.getByTestId('footer-cookies-link').click();
  }

  async expectCookiesPage() {
    await expect(this.page).toHaveURL(/\/cookies$/);
    await expect(this.page.getByRole('heading', { name: 'Cookies', exact: true })).toBeVisible();
  }

  async navigateBack() {
    await this.page.goBack();
  }

  async expectChatInputVisible() {
    await expect(this.page.locator(this.selectors.messageInput)).toBeVisible();
  }

  async sendSequentialMessages(count, prefix) {
    this.sequentialPrefix = prefix;
    for (let index = 1; index <= count; index += 1) {
      await this.sendMessage(`${prefix} ${index}`);
      await this.expectUserMessageVisible(`${prefix} ${index}`);
      this.sequentialMessageIndex = index;
    }
  }

  async refreshPage() {
    await this.page.reload();
    await this.expectChatInputVisible();
    this.lastInboundCountAfterRefresh = await this.page.locator(this.selectors.inboundMessageWrapper).count();
  }

  async sendNextSequentialMessage() {
    let sendWasObserved = false;
    const nextIndex = this.sequentialMessageIndex + 1;
    const nextMessage = `${this.sequentialPrefix} ${nextIndex}`;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.sendMessage(nextMessage);
      await expect(this.page.locator(this.selectors.messageInput)).toHaveValue('');

      try {
        await expect.poll(async () => this.page.locator(this.selectors.inboundMessageWrapper).count(), {
          timeout: 10_000,
          intervals: [500, 1000, 2000]
        }).toBeGreaterThan(this.lastInboundCountAfterRefresh);

        sendWasObserved = true;
        this.sequentialMessageIndex = nextIndex;
        break;
      } catch {
        // Retry once session history has fully rehydrated after refresh.
      }
    }

    expect(sendWasObserved).toBe(true);
  }
}
