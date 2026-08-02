import { useCallback, useEffect, useState } from 'react';
import type { Item, ItemSource, Tier, TierList } from '../domain/tierList';
import { createTierListApiClient, type ItemCreatePayload, type ItemSourceCreatePayload, type TierCreatePayload } from '../api/client';

const apiClient = createTierListApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });

export function useTierList(id: string | undefined) {
  const [tierList, setTierList] = useState<TierList | null>(null);
  const [itemSources, setItemSources] = useState<ItemSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTierList = useCallback(async () => {
    if (!id) {
      setTierList(null);
      setItemSources([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loadedTierList, loadedItemSources] = await Promise.all([
        apiClient.getTierList(id),
        apiClient.listItemSources(id),
      ]);
      setTierList(loadedTierList);
      setItemSources(loadedItemSources);
    } catch (err) {
      console.error('Failed to load tier list', err);
      setError(err instanceof Error ? err.message : 'Failed to load tier list');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadTierList);
  }, [loadTierList]);

  const createTier = useCallback(async (payload: TierCreatePayload) => {
    if (!tierList) {
      throw new Error('Tier list is not loaded');
    }

    const createdTier = await apiClient.createTier(tierList.id, payload);
    setTierList((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tiers: sortTiers([...current.tiers, createdTier]),
      };
    });

    return createdTier;
  }, [tierList]);

  const uploadImage = useCallback(async (file: File) => {
    const data = await fileToBase64(file);

    return apiClient.createImage({
      contentType: file.type || 'application/octet-stream',
      data,
    });
  }, []);

  const createItem = useCallback(async (payload: ItemCreatePayload) => {
    if (!tierList) {
      throw new Error('Tier list is not loaded');
    }

    const createdItem = await apiClient.createItem(tierList.id, payload);

    setTierList((current) => {
      if (!current) {
        return current;
      }

      if (!createdItem.tierId) {
        return {
          ...current,
          unrankedItems: sortItems([...current.unrankedItems, createdItem]),
        };
      }

      return {
        ...current,
        tiers: current.tiers.map((tier) => (
          tier.id === createdItem.tierId
            ? { ...tier, items: sortItems([...tier.items, createdItem]) }
            : tier
        )),
      };
    });

    return createdItem;
  }, [tierList]);

  const createItemSource = useCallback(async (payload: ItemSourceCreatePayload) => {
    if (!tierList) {
      throw new Error('Tier list is not loaded');
    }

    const createdItemSource = await apiClient.createItemSource(tierList.id, payload);
    setItemSources((current) => [...current, createdItemSource]);
    return createdItemSource;
  }, [tierList]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!tierList) {
      throw new Error('Tier list is not loaded');
    }

    await apiClient.deleteItem(tierList.id, itemId);
    setTierList((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tiers: current.tiers.map((tier) => ({
          ...tier,
          items: tier.items.filter((item) => item.id !== itemId),
        })),
        unrankedItems: current.unrankedItems.filter((item) => item.id !== itemId),
      };
    });
  }, [tierList]);

  return {
    tierList,
    itemSources,
    isLoading,
    error,
    reload: loadTierList,
    setTierList,
    uploadImage,
    createTier,
    createItem,
    createItemSource,
    deleteItem,
  };
}

async function fileToBase64(file: Blob) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';

  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function sortTiers(tiers: Tier[]) {
  return [...tiers].sort((leftTier, rightTier) => {
    const orderDifference = leftTier.order - rightTier.order;
    if (orderDifference !== 0) {
      return orderDifference;
    }

    return leftTier.rank - rightTier.rank;
  });
}

function sortItems(items: Item[]) {
  return [...items].sort((leftItem, rightItem) => leftItem.order - rightItem.order);
}
