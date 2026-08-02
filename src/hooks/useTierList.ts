import { useCallback, useEffect, useState } from 'react';
import type { TierList } from '../domain/tierList';
import { createTierListApiClient } from '../api/client';

const apiClient = createTierListApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });

export function useTierList(id: string | undefined) {
  const [tierList, setTierList] = useState<TierList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTierList = useCallback(async () => {
    if (!id) {
      setTierList(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getTierList(id);
      setTierList(data);
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

  const createTier = useCallback(async (name: string) => {
    if (!tierList) {
      throw new Error('Tier list is not loaded');
    }

    const payload = {
      name,
      rank: tierList.tiers.length,
      order: tierList.tiers.length,
    };

    const createdTier = await apiClient.createTier(tierList.id, payload);
    setTierList((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tiers: [...current.tiers, createdTier],
      };
    });

    return createdTier;
  }, [tierList]);

  const createItem = useCallback(async (name: string, tierId?: string) => {
    if (!tierList) {
      throw new Error('Tier list is not loaded');
    }

    const createdItem = await apiClient.createItem(tierList.id, {
      name,
      tierId: tierId ?? null,
    });

    setTierList((current) => {
      if (!current) {
        return current;
      }

      if (!createdItem.tierId) {
        return {
          ...current,
          unrankedItems: [...current.unrankedItems, createdItem],
        };
      }

      return {
        ...current,
        tiers: current.tiers.map((tier) => (
          tier.id === createdItem.tierId
            ? { ...tier, items: [...tier.items, createdItem] }
            : tier
        )),
      };
    });

    return createdItem;
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
    isLoading,
    error,
    reload: loadTierList,
    setTierList,
    createTier,
    createItem,
    deleteItem,
  };
}
