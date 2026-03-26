import type { TierList } from '../domain/tierList';

export interface TierListRepository {
    getAll(): Promise<TierList[]>;
    getById(id: string): Promise<TierList | null>;
    save(tierList: TierList): Promise<void>;
    delete(id: string): Promise<void>;
}