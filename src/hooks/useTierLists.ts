import { useCallback, useEffect, useState } from 'react';
import type { TierList } from '../domain/tierList';
import { createTierListApiClient, type TierListCreatePayload } from '../api/client';

const apiClient = createTierListApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });

export function useTierLists() {
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTierLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.listTierLists();
      setTierLists(data);
    } catch (err) {
      console.error('Failed to load tier lists', err);
      setError(err instanceof Error ? err.message : 'Failed to load tier lists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTierList = useCallback(async (payload: TierListCreatePayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const createdList = await apiClient.createTierList(payload);
      setTierLists((current) => [createdList, ...current]);
      return createdList;
    } catch (err) {
      console.error('Failed to create tier list', err);
      setError(err instanceof Error ? err.message : 'Failed to create tier list');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTierList = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.deleteTierList(id);
      setTierLists((current) => current.filter((list) => list.id !== id));
    } catch (err) {
      console.error('Failed to delete tier list', err);
      setError(err instanceof Error ? err.message : 'Failed to delete tier list');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadTierLists);
  }, [loadTierLists]);

  return {
    tierLists,
    isLoading,
    error,
    reload: loadTierLists,
    createTierList,
    deleteTierList,
    setTierLists,
  };
}
