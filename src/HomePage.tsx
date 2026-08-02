import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDefaultTierList, type TierList } from './domain/tierList';
import { tierListRepository } from './repositories/IndexedDbTierListRepository';

function HomePage() {
    const navigate = useNavigate();
    const [tierLists, setTierLists] = useState<TierList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadTierLists = async () => {
            try {
                let loadedTierLists = await tierListRepository.getAll();

                if (loadedTierLists.length === 0) {
                    const defaultList = createDefaultTierList();
                    await tierListRepository.save(defaultList);
                    loadedTierLists = [defaultList];
                }

                if (isMounted) {
                    setTierLists(loadedTierLists);
                }
            } catch (error) {
                console.error('Failed to load tier lists', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadTierLists();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleCreateNewList = useCallback(async () => {
        if (!newListName.trim()) {
            return;
        }

        const now = new Date().toISOString();
        const newList: TierList = {
            id: crypto.randomUUID(),
            name: newListName.trim(),
            tiers: [],
            createdAt: now,
            updatedAt: now,
        };

        try {
            await tierListRepository.save(newList);
            setTierLists([newList, ...tierLists]);
            setNewListName('');
            navigate(`/edit/${newList.id}`);
        } catch (error) {
            console.error('Failed to create tier list', error);
        }
    }, [newListName, tierLists, navigate]);

    const handleDeleteList = useCallback(
        async (id: string, e: React.MouseEvent) => {
            e.stopPropagation();

            if (!confirm('Are you sure you want to delete this tier list?')) {
                return;
            }

            try {
                await tierListRepository.delete(id);
                setTierLists(tierLists.filter((list) => list.id !== id));
            } catch (error) {
                console.error('Failed to delete tier list', error);
            }
        },
        [tierLists],
    );

    if (isLoading) {
        return <p className="tier-list-loading">Loading tier lists...</p>;
    }

    return (
        <main className="tier-list-container">
            <h1 className="tier-list-title">Tier Lists</h1>

            <div className="new-list-section">
                <div className="new-list-form">
                    <input
                        className="new-list-input"
                        type="text"
                        placeholder="Enter tier list name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleCreateNewList();
                            }
                        }}
                    />
                    <button
                        className="new-list-button"
                        onClick={handleCreateNewList}
                        type="button"
                        disabled={!newListName.trim()}
                    >
                        Create New Tier List
                    </button>
                </div>
            </div>

            <div className="tier-lists-grid">
                {tierLists.length === 0 ? (
                    <p>No tier lists yet. Create one to get started!</p>
                ) : (
                    tierLists.map((tierList) => (
                        <div
                            key={tierList.id}
                            className="tier-list-card"
                            onClick={() => navigate(`/edit/${tierList.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigate(`/edit/${tierList.id}`);
                                }
                            }}
                        >
                            <div className="card-content">
                                <h2 className="card-title">{tierList.name}</h2>
                                <p className="card-meta">
                                    Tiers: {tierList.tiers.length} | Items:{' '}
                                    {tierList.tiers.reduce((sum, tier) => sum + tier.items.length, 0)}
                                </p>
                            </div>
                            <button
                                className="delete-button"
                                onClick={(e) => handleDeleteList(tierList.id, e)}
                                type="button"
                                aria-label={`Delete ${tierList.name}`}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

export default HomePage;