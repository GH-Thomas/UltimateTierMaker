import type { ImageRef, Item, ItemSource, ItemSourceRef, Tier, TierList } from '../domain/tierList';

type TierListApiClientConfig = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type ImageCreatePayload = {
  contentType: string;
  data: string;
};

export type TierListCreatePayload = {
  name: string;
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  description?: string | null;
  tierSpacing?: number;
};

export type TierListUpdatePayload = {
  name?: string | null;
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  description?: string | null;
  tierSpacing?: number | null;
};

export type TierCreatePayload = {
  name: string;
  rank: number;
  tierImage?: ImageRef | null;
  tierColor?: string | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  tierSize?: number;
  tierSymbol?: ImageRef | null;
  order?: number;
};

export type TierUpdatePayload = {
  name?: string | null;
  rank?: number | null;
  tierImage?: ImageRef | null;
  tierColor?: string | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  tierSize?: number | null;
  tierSymbol?: ImageRef | null;
  order?: number | null;
};

export type ItemCreatePayload = {
  name: string;
  nicknames?: string[];
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  source?: ItemSourceRef | null;
  description?: string | null;
  tierId?: string | null;
  order?: number;
};

export type ItemUpdatePayload = {
  name?: string | null;
  nicknames?: string[] | null;
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  source?: ItemSourceRef | null;
  description?: string | null;
  tierId?: string | null;
  order?: number | null;
};

export type ItemSourceCreatePayload = {
  name: string;
  description?: string | null;
  image?: ImageRef | null;
  link?: string | null;
};

export type ItemSourceUpdatePayload = {
  name?: string | null;
  description?: string | null;
  image?: ImageRef | null;
  link?: string | null;
};

type TierListReadPayload = {
  id: string;
  name: string;
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  description?: string | null;
  tierSpacing?: number;
  tiers: TierReadPayload[];
  unrankedItems: ItemReadPayload[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TierListSummaryReadPayload = {
  id: string;
  name: string;
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  description?: string | null;
  tierSpacing?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TierReadPayload = {
  id: string;
  name: string;
  rank: number;
  tierImage?: ImageRef | null;
  tierColor?: string | null;
  backgroundImage?: ImageRef | null;
  backgroundColor?: string | null;
  tierSize?: number;
  tierSymbol?: ImageRef | null;
  order?: number;
  items: ItemReadPayload[];
};

type ItemReadPayload = {
  id: string;
  name: string;
  nicknames?: string[];
  image?: ImageRef | null;
  backgroundImage?: ImageRef | null;
  source?: ItemSourceReadPayload | null;
  description?: string | null;
  tierId?: string | null;
  order?: number;
};

type ItemSourceReadPayload = {
  id: string;
  name: string;
  description?: string | null;
  image?: ImageRef | null;
  link?: string | null;
  tierListId: string;
};

export interface TierListApiClient {
  listTierLists(): Promise<TierList[]>;
  getTierList(id: string): Promise<TierList>;
  createImage(payload: ImageCreatePayload): Promise<ImageRef>;
  createTierList(payload: TierListCreatePayload): Promise<TierList>;
  updateTierList(id: string, payload: TierListUpdatePayload): Promise<TierList>;
  deleteTierList(id: string): Promise<void>;
  createTier(tierListId: string, payload: TierCreatePayload): Promise<Tier>;
  updateTier(tierListId: string, tierId: string, payload: TierUpdatePayload): Promise<Tier>;
  deleteTier(tierListId: string, tierId: string): Promise<void>;
  createItem(tierListId: string, payload: ItemCreatePayload): Promise<Item>;
  updateItem(tierListId: string, itemId: string, payload: ItemUpdatePayload): Promise<Item>;
  deleteItem(tierListId: string, itemId: string): Promise<void>;
  listItemSources(tierListId: string): Promise<ItemSource[]>;
  createItemSource(tierListId: string, payload: ItemSourceCreatePayload): Promise<ItemSource>;
  updateItemSource(tierListId: string, sourceId: string, payload: ItemSourceUpdatePayload): Promise<ItemSource>;
  deleteItemSource(tierListId: string, sourceId: string): Promise<void>;
  deleteImage(imageId: string): Promise<void>;
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

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  };

  return {
    async createImage(payload) {
      return request<ImageRef>('/api/v0/lists/images', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async listTierLists() {
      const payload = await request<TierListSummaryReadPayload[]>('/api/v0/lists/tier-lists', {
        method: 'GET',
      });

      return payload.map(mapTierListSummaryReadToModel);
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

    async updateTierList(id, payload) {
      const responsePayload = await request<TierListReadPayload>(`/api/v0/lists/tier-lists/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      return mapTierListReadToModel(responsePayload);
    },

    async deleteTierList(id) {
      await request<void>(`/api/v0/lists/tier-lists/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },

    async createTier(tierListId, payload) {
      const responsePayload = await request<TierReadPayload>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/tiers`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return mapTierReadToModel(responsePayload);
    },

    async updateTier(tierListId, tierId, payload) {
      const responsePayload = await request<TierReadPayload>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/tiers/${encodeURIComponent(tierId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      return mapTierReadToModel(responsePayload);
    },

    async deleteTier(tierListId, tierId) {
      await request<void>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/tiers/${encodeURIComponent(tierId)}`,
        {
          method: 'DELETE',
        },
      );
    },

    async createItem(tierListId, payload) {
      const responsePayload = await request<ItemReadPayload>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/items`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return mapItemReadToModel(responsePayload);
    },

    async updateItem(tierListId, itemId, payload) {
      const responsePayload = await request<ItemReadPayload>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/items/${encodeURIComponent(itemId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      return mapItemReadToModel(responsePayload);
    },

    async deleteItem(tierListId, itemId) {
      await request<void>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/items/${encodeURIComponent(itemId)}`,
        {
          method: 'DELETE',
        },
      );
    },

    async listItemSources(tierListId) {
      const payload = await request<ItemSourceReadPayload[]>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/item-sources`,
        {
          method: 'GET',
        },
      );

      return payload.map(mapItemSourceReadToModel);
    },

    async createItemSource(tierListId, payload) {
      const responsePayload = await request<ItemSourceReadPayload>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/item-sources`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return mapItemSourceReadToModel(responsePayload);
    },

    async updateItemSource(tierListId, sourceId, payload) {
      const responsePayload = await request<ItemSourceReadPayload>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/item-sources/${encodeURIComponent(sourceId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      return mapItemSourceReadToModel(responsePayload);
    },

    async deleteItemSource(tierListId, sourceId) {
      await request<void>(
        `/api/v0/lists/tier-lists/${encodeURIComponent(tierListId)}/item-sources/${encodeURIComponent(sourceId)}`,
        {
          method: 'DELETE',
        },
      );
    },

    async deleteImage(imageId) {
      await request<void>(`/api/v0/lists/images/${encodeURIComponent(imageId)}`, {
        method: 'DELETE',
      });
    },
  };
}

function mapTierListSummaryReadToModel(payload: TierListSummaryReadPayload): TierList {
  const now = new Date().toISOString();

  return {
    id: payload.id,
    name: payload.name,
    tiers: [],
    unrankedItems: [],
    image: payload.image ?? null,
    backgroundImage: payload.backgroundImage ?? null,
    backgroundColor: payload.backgroundColor ?? null,
    description: payload.description ?? null,
    tierSpacing: payload.tierSpacing ?? 1,
    createdAt: payload.createdAt ?? now,
    updatedAt: payload.updatedAt ?? now,
  };
}

function mapTierListReadToModel(payload: TierListReadPayload): TierList {
  const now = new Date().toISOString();

  return {
    id: payload.id,
    name: payload.name,
    image: payload.image ?? null,
    backgroundImage: payload.backgroundImage ?? null,
    backgroundColor: payload.backgroundColor ?? null,
    description: payload.description ?? null,
    tierSpacing: payload.tierSpacing ?? 1,
    tiers: payload.tiers.map(mapTierReadToModel),
    unrankedItems: payload.unrankedItems.map(mapItemReadToModel),
    createdAt: payload.createdAt ?? now,
    updatedAt: payload.updatedAt ?? now,
  };
}

function mapTierReadToModel(payload: TierReadPayload): Tier {
  return {
    id: payload.id,
    name: payload.name,
    rank: payload.rank,
    tierImage: payload.tierImage ?? null,
    tierColor: payload.tierColor ?? null,
    backgroundImage: payload.backgroundImage ?? null,
    backgroundColor: payload.backgroundColor ?? null,
    tierSize: payload.tierSize ?? 1,
    tierSymbol: payload.tierSymbol ?? null,
    order: payload.order ?? payload.rank,
    items: payload.items.map(mapItemReadToModel),
  };
}

function mapItemReadToModel(payload: ItemReadPayload): Item {
  return {
    id: payload.id,
    label: payload.name,
    imageUrl: undefined,
    nicknames: payload.nicknames ?? [],
    image: payload.image ?? null,
    backgroundImage: payload.backgroundImage ?? null,
    source: payload.source ? mapItemSourceReadToModel(payload.source) : null,
    description: payload.description ?? null,
    tierId: payload.tierId ?? null,
    order: payload.order ?? 0,
  };
}

function mapItemSourceReadToModel(payload: ItemSourceReadPayload): ItemSource {
  return {
    id: payload.id,
    name: payload.name,
    description: payload.description ?? null,
    image: payload.image ?? null,
    link: payload.link ?? null,
    tierListId: payload.tierListId,
  };
}
