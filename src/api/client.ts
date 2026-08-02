import type { Item, Tier, TierList } from '../domain/tierList';

type TierListApiClientConfig = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type TierListCreatePayload = {
  id: string;
  name: string;
  tiers: TierCreatePayload[];
};

type TierCreatePayload = {
  id: string;
  name: string;
  rank: number;
  order?: number;
  items: ItemCreatePayload[];
};

type ItemCreatePayload = {
  id: string;
  label: string;
  imageUrl?: string | null;
  order?: number;
};

type TierListReadPayload = {
  id: string;
  name: string;
  tiers: TierReadPayload[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TierReadPayload = {
  id: string;
  name: string;
  rank: number;
  order?: number;
  items: ItemReadPayload[];
};

type ItemReadPayload = {
  id: string;
  label: string;
  imageUrl?: string | null;
  order?: number;
};

export interface TierListApiClient {
  listTierLists(): Promise<TierList[]>;
  getTierList(id: string): Promise<TierList | null>;
  createTierList(payload: TierListCreatePayload): Promise<TierList>;
}

export function createTierListApiClient(config: TierListApiClientConfig = {}): TierListApiClient {
  const resolvedBaseUrl = config.baseUrl && config.baseUrl !== '' ? config.baseUrl : undefined;
  const baseUrl = resolvedBaseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const fetchImpl = config.fetchImpl ?? fetch;

  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const requestUrl = path.startsWith('http') ? path : `${normalizedBaseUrl}${path}`;
    const response = await fetchImpl(requestUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  };

  return {
    async listTierLists() {
      const payload = await request<TierListReadPayload[]>('/api/v0/lists/tier-lists', {
        method: 'GET',
      });

      return payload.map(mapTierListReadToModel);
    },

    async getTierList(id: string) {
      const payload = await request<TierListReadPayload>(`/api/v0/lists/tier-lists/${encodeURIComponent(id)}`, {
        method: 'GET',
      });

      return mapTierListReadToModel(payload);
    },

    async createTierList(payload) {
      const responsePayload = await request<TierListReadPayload>('/api/v0/lists/tier-lists', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return mapTierListReadToModel(responsePayload);
    },
  };
}

function mapTierListReadToModel(payload: TierListReadPayload): TierList {
  return {
    id: payload.id,
    name: payload.name,
    tiers: payload.tiers.map(mapTierReadToModel),
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: payload.updatedAt ?? new Date().toISOString(),
  };
}

function mapTierReadToModel(payload: TierReadPayload): Tier {
  return {
    id: payload.id,
    name: payload.name,
    rank: payload.rank,
    items: payload.items.map(mapItemReadToModel),
  };
}

function mapItemReadToModel(payload: ItemReadPayload): Item {
  return {
    id: payload.id,
    label: payload.label,
    imageUrl: payload.imageUrl ?? undefined,
  };
}
