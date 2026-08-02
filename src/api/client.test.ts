import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createTierListApiClient } from './client';

describe('createTierListApiClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('requests tier lists and maps the API payload into the app model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'list-1',
          name: 'My list',
          tiers: [
            {
              id: 'tier-1',
              name: 'S',
              rank: 1,
              order: 0,
              items: [{ id: 'item-1', label: 'Alpha', imageUrl: null, order: 0 }],
            },
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ],
    });

    globalThis.fetch = fetchMock as typeof fetch;

    const client = createTierListApiClient({ baseUrl: 'http://localhost:8000' });
    const result = await client.listTierLists();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v0/lists/tier-lists',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'list-1',
      name: 'My list',
      tiers: [
        {
          id: 'tier-1',
          name: 'S',
          rank: 1,
          items: [{ id: 'item-1', label: 'Alpha' }],
        },
      ],
    });
  });

  it('uses the current browser origin when no base url is configured', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://tiermaker.example' } });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    globalThis.fetch = fetchMock as typeof fetch;

    const client = createTierListApiClient();
    await client.listTierLists();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://tiermaker.example/api/v0/lists/tier-lists',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
