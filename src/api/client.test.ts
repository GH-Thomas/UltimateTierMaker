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
          description: 'Summary only',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ],
      text: async () => JSON.stringify([
        {
          id: 'list-1',
          name: 'My list',
          description: 'Summary only',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ]),
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
      description: 'Summary only',
      tiers: [],
      unrankedItems: [],
    });
  });

  it('requests a tier list detail and maps tiers and unranked items', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        id: 'list-1',
        name: 'My list',
        tiers: [
          {
            id: 'tier-1',
            name: 'S',
            rank: 1,
            order: 0,
            items: [{ id: 'item-1', name: 'Alpha', image: null, order: 0 }],
          },
        ],
        unrankedItems: [{ id: 'item-2', name: 'Beta', image: null, order: 1 }],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }),
    });

    globalThis.fetch = fetchMock as typeof fetch;

    const client = createTierListApiClient({ baseUrl: 'http://localhost:8000' });
    const result = await client.getTierList('list-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v0/lists/tier-lists/list-1',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.tiers[0]).toMatchObject({
      id: 'tier-1',
      name: 'S',
      items: [{ id: 'item-1', label: 'Alpha' }],
    });
    expect(result.unrankedItems).toMatchObject([{ id: 'item-2', label: 'Beta' }]);
  });

  it('handles delete endpoints that return no content', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => '',
    });

    globalThis.fetch = fetchMock as typeof fetch;

    const client = createTierListApiClient({ baseUrl: 'http://localhost:8000' });
    await expect(client.deleteTierList('list-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v0/lists/tier-lists/list-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('does not send frontend-generated ids in create requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        id: 'list-1',
        name: 'My list',
        tiers: [],
        unrankedItems: [],
      }),
    });

    globalThis.fetch = fetchMock as typeof fetch;

    const client = createTierListApiClient({ baseUrl: 'http://localhost:8000' });
    await client.createTierList({ name: 'My list' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v0/lists/tier-lists',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'My list' }),
      }),
    );
  });

  it('uses the current browser origin when no base url is configured', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://tiermaker.example' } });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '[]',
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
