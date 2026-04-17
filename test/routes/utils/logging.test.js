import { logToService } from '../../../src/utils/logging';

describe('logToService', () => {
  const originalPathname = globalThis.location.pathname;
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    globalThis.history.replaceState({}, '', originalPathname);
    jest.clearAllMocks();
  });

  test('should send correct payload with default supportType (ETA)', async () => {
    globalThis.location.pathname = '/random/path';
    await logToService('info', 'Test message');

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.service).toBe('EUSS');
    expect(body.level).toBe('info');
    expect(body.message).toBe('Test message');
    expect(body).toHaveProperty('timestamp');
    expect(body).not.toHaveProperty('metadata');
  });

  test('should include metadata if provided', async () => {
    globalThis.history.replaceState({}, '', '/');
    const metadata = { id: 123, action: 'test' };
    await logToService('info', 'With metadata', metadata);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.metadata).toEqual(metadata);
  });
});
