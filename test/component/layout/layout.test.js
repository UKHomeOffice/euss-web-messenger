import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

jest.mock('../../../src/google-analytics/google-analytics', () => ({
  initialiseGoogleTagManager: jest.fn(),
}));

jest.mock('../../../src/env-bootstrap', () => ({
  getEnvValueByKey: jest.fn(),
}));

jest.mock('../../../src/components/layout/header/header', () => () => <div data-testid="layout-header" />);
jest.mock('../../../src/components/layout/banner/phase-banner', () => () => <div data-testid="phase-banner" />);
jest.mock('../../../src/components/cookies/cookie-banner', () => () => <div data-testid="cookie-banner" />);
jest.mock('../../../src/components/cookies/cookie-banner-visibility-provider', () => ({
  CookieBannerVisibilityProvider: ({ children }) => (
    <div data-testid="cookie-banner-visibility-provider">{children}</div>
  ),
}));
jest.mock('../../../src/components/layout/footer/footer', () => () => <div data-testid="layout-footer" />);

import RootLayout from '../../../src/components/layout/layout';
import { initialiseGoogleTagManager } from '../../../src/google-analytics/google-analytics';
import { getEnvValueByKey } from '../../../src/env-bootstrap';

describe('RootLayout component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.className = '';
  });

  test('renders layout children and shared layout components', () => {
    render(
      <MemoryRouter>
        <RootLayout>
          <div data-testid="page-content">Page content</div>
        </RootLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('cookie-banner-visibility-provider')).toBeInTheDocument();
    expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    expect(screen.getByTestId('layout-header')).toBeInTheDocument();
    expect(screen.getByTestId('phase-banner')).toBeInTheDocument();
    expect(screen.getByTestId('layout-footer')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(document.body.classList.contains('govuk-template__body')).toBe(true);
  });

  test('initialises Google Tag Manager when analytics is enabled', () => {
    getEnvValueByKey.mockImplementation((key) => {
      if (key === 'ENABLE_ANALYTICS') return true;
      if (key === 'GOOGLE_TAG_MANAGER_ID') return 'GTM-123';
      return undefined;
    });

    render(
      <MemoryRouter>
        <RootLayout>
          <div />
        </RootLayout>
      </MemoryRouter>
    );

    expect(initialiseGoogleTagManager).toHaveBeenCalledWith('GTM-123', expect.any(String));
  });

  test('does not initialise Google Tag Manager when analytics is disabled', () => {
    getEnvValueByKey.mockReturnValue(false);

    render(
      <MemoryRouter>
        <RootLayout>
          <div />
        </RootLayout>
      </MemoryRouter>
    );

    expect(initialiseGoogleTagManager).not.toHaveBeenCalled();
  });
});
