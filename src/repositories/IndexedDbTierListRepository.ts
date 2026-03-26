import type { TierList } from '../domain/tierList';
import type { TierListRepository } from './TierListRepository';

const DB_NAME = 'ultimate-tier-maker';
const DB_VERSION = 1;
const STORE_NAME = 'tierLists';

export class IndexedDbTierListRepository implements TierListRepository {
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = this.openDatabase();
    }

    async getAll(): Promise<TierList[]> {
        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const lists = (request.result as TierList[]).sort(
                    (a, b) => b.updatedAt.localeCompare(a.updatedAt),
                );
                resolve(lists);
            };

            request.onerror = () => {
                reject(request.error ?? new Error('Failed to load tier lists'));
            };
        });
    }

    async getById(id: string): Promise<TierList | null> {
        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve((request.result as TierList | undefined) ?? null);
            };

            request.onerror = () => {
                reject(request.error ?? new Error('Failed to load tier list'));
            };
        });
    }

    async save(tierList: TierList): Promise<void> {
        const db = await this.dbPromise;
        const recordToSave: TierList = {
            ...tierList,
            updatedAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(recordToSave);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error ?? new Error('Failed to save tier list'));
            tx.onabort = () => reject(tx.error ?? new Error('Saving tier list was aborted'));
        });
    }

    async delete(id: string): Promise<void> {
        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.delete(id);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error ?? new Error('Failed to delete tier list'));
            tx.onabort = () => reject(tx.error ?? new Error('Deleting tier list was aborted'));
        });
    }

    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
        });
    }
}

export const tierListRepository: TierListRepository = new IndexedDbTierListRepository();