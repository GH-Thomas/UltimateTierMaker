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
    void loadTierList();
  }, [loadTierList]);

  return {
    tierList,
    isLoading,
    error,
    reload: loadTierList,
    setTierList,
  };
}
