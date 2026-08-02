import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem, type TierList as TierListModel } from './domain/tierList';
import { tierListRepository } from './repositories/IndexedDbTierListRepository';
import Tier from './components/Tier';

const TIER_COLORS = ['#ff7e6b', '#ffb86b', '#ffe96b', '#9ad26d', '#6cc7b8', '#79ace9'];

function EditListPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tierList, setTierList] = useState<TierListModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTierIndex, setSelectedTierIndex] = useState(-1);
    const [itemName, setItemName] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadTierList = async () => {
            if (!id) {
                navigate('/');
                return;
            }

            try {
                const loaded = await tierListRepository.getById(id);
                if (!loaded) {
                    navigate('/');
                    return;
                }

                if (isMounted) {
                    setTierList(loaded);
                }
            } catch (error) {
                console.error('Failed to load tier list', error);
                navigate('/');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadTierList();

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    const handleTierSelect = useCallback((index: number) => {
        setSelectedTierIndex(index);
    }, []);

    const handleAddItem = useCallback(async () => {
        if (!tierList || selectedTierIndex < 0 || !itemName.trim()) {
            return;
        }

        const updatedTierList = { ...tierList };
        const selectedTier = updatedTierList.tiers[selectedTierIndex];
        if (!selectedTier) {
            return;
        }

        const newItem = createItem(itemName.trim(), `${tierList.id}-${selectedTier.id}-${Date.now()}`);
        selectedTier.items.push(newItem);

        try {
            await tierListRepository.save(updatedTierList);
            setTierList(updatedTierList);
            setItemName('');
        } catch (error) {
            console.error('Failed to add item', error);
        }
    }, [tierList, selectedTierIndex, itemName]);

    const handleRemoveItem = useCallback(
        async (tierIndex: number, itemId: string) => {
            if (!tierList) {
                return;
            }

            const updatedTierList = { ...tierList };
            const tier = updatedTierList.tiers[tierIndex];
            if (!tier) {
                return;
            }

            tier.items = tier.items.filter((item) => item.id !== itemId);

            try {
                await tierListRepository.save(updatedTierList);
                setTierList(updatedTierList);
            } catch (error) {
                console.error('Failed to remove item', error);
            }
        },
        [tierList],
    );

    if (isLoading) {
        return <p className="tier-list-loading">Loading tier list...</p>;
    }

    if (!tierList) {
        return <p className="tier-list-loading">Tier list not found</p>;
    }

    const tiers = tierList.tiers;
    const selectedTier = selectedTierIndex >= 0 ? tiers[selectedTierIndex] : null;

    return (
        <main className="tier-list-container">
            <button
                className="back-button"
                onClick={() => navigate('/')}
                type="button"
                aria-label="Go back"
            >
                ← Back
            </button>

            <h1 className="tier-list-title">{tierList.name}</h1>

            <div className="tier-list-board">
                {tiers.map((tier, index) => (
                    <Tier
                        key={tier.id}
                        tier={tier}
                        color={TIER_COLORS[index % TIER_COLORS.length]}
                        isSelected={selectedTierIndex === index}
                        onSelect={() => handleTierSelect(index)}
                        onItemClick={(item) => handleRemoveItem(index, item.id)}
                    />
                ))}
            </div>

            {selectedTier && (
                <div className="add-item-section">
                    <div className="add-item-form">
                        <input
                            className="item-name-input"
                            type="text"
                            placeholder="Enter item name"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddItem();
                                }
                            }}
                        />
                        <button
                            className="add-item-button"
                            onClick={handleAddItem}
                            type="button"
                            disabled={!itemName.trim()}
                        >
                            Add Item to {selectedTier.name}
                        </button>
                    </div>
                    <p className="add-item-hint">Click items to remove them</p>
                </div>
            )}

            {selectedTierIndex < 0 && (
                <div className="add-item-section">
                    <p className="add-item-hint">Select a tier to add items to it</p>
                </div>
            )}
        </main>
    );
}

export default EditListPage;
