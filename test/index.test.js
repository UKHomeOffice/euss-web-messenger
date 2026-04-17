jest.mock('../src/env-bootstrap', () => ({
  loadEnvironmentConfig: jest.fn((onSuccess) => {
    if (onSuccess) onSuccess();
  }),
  getEnvValueByKey: jest.fn(() => {}),
}));

describe('document.title logic in index.js', () => {

  beforeEach(() => {
    // Reset module cache to ensure fresh execution
    jest.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
  });

  const originalTitle = document.title;
  const originalPathname = globalThis.location.pathname;

  afterEach(() => {
    document.title = originalTitle;
    globalThis.history.replaceState({}, '', originalPathname);
    jest.clearAllMocks();
  });

  test('sets title to "Webchat: UK EUSS support - GOV.UK" if pathname is /', () => {
    globalThis.history.replaceState({}, '', '/');
    require('../src/index');
    expect(document.title).toBe('Webchat: UK EUSS support - GOV.UK');
  });
});
