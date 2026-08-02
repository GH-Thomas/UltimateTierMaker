import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTierList } from './hooks/useTierList';
import Item from './components/Item';
import Tier from './components/Tier';

const TIER_COLORS = ['#ff7e6b', '#ffb86b', '#ffe96b', '#9ad26d', '#6cc7b8', '#79ace9'];

function EditListPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tierList, isLoading, error, createTier, createItem, deleteItem } = useTierList(id);
    const [selectedTierIndex, setSelectedTierIndex] = useState(-1);
    const [tierName, setTierName] = useState('');
    const [itemName, setItemName] = useState('');

    const handleTierSelect = useCallback((index: number) => {
        setSelectedTierIndex(index);
    }, []);

    const handleAddTier = useCallback(async () => {
        if (!tierName.trim()) {
            return;
        }

        try {
            await createTier(tierName.trim());
            setSelectedTierIndex(tierList?.tiers.length ?? 0);
            setTierName('');
        } catch (error) {
            console.error('Failed to add tier', error);
        }
    }, [createTier, tierList, tierName]);

    const handleAddItem = useCallback(async () => {
        if (!tierList || selectedTierIndex < 0 || !itemName.trim()) {
            return;
        }

        const selectedTier = tierList.tiers[selectedTierIndex];
        if (!selectedTier) {
            return;
        }

        try {
            await createItem(itemName.trim(), selectedTier.id);
            setItemName('');
        } catch (error) {
            console.error('Failed to add item', error);
        }
    }, [createItem, itemName, selectedTierIndex, tierList]);

    const handleRemoveItem = useCallback(
        async (tierIndex: number, itemId: string) => {
            if (!tierList) {
                return;
            }

            const tier = tierList.tiers[tierIndex];
            if (!tier) {
                return;
            }

            try {
                await deleteItem(itemId);
            } catch (error) {
                console.error('Failed to remove item', error);
            }
        },
        [deleteItem, tierList],
    );

    const handleRemoveUnrankedItem = useCallback(
        async (itemId: string) => {
            try {
                await deleteItem(itemId);
            } catch (error) {
                console.error('Failed to remove unranked item', error);
            }
        },
        [deleteItem],
    );

    if (isLoading) {
        return <p className="tier-list-loading">Loading tier list...</p>;
    }

    if (error) {
        return <p className="tier-list-loading">{error}</p>;
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

            <div className="add-tier-section">
                <div className="add-item-form">
                    <input
                        className="item-name-input"
                        type="text"
                        placeholder="Enter tier name"
                        value={tierName}
                        onChange={(e) => setTierName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddTier();
                            }
                        }}
                    />
                    <button
                        className="add-tier-button"
                        onClick={handleAddTier}
                        type="button"
                        disabled={!tierName.trim()}
                    >
                        Add Tier
                    </button>
                </div>
            </div>

            <div className="tier-list-board">
                {tiers.map((tier, index) => (
                    <Tier
                        key={tier.id}
                        tier={tier}
                        color={tier.tierColor ?? TIER_COLORS[index % TIER_COLORS.length]}
                        isSelected={selectedTierIndex === index}
                        onSelect={() => handleTierSelect(index)}
                        onItemClick={(item) => handleRemoveItem(index, item.id)}
                    />
                ))}
            </div>

            {tierList.unrankedItems.length > 0 && (
                <section className="unranked-section">
                    <h2 className="unranked-title">Unranked Items</h2>
                    <div className="unranked-items">
                        {tierList.unrankedItems.map((item) => (
                            <Item key={item.id} item={item} onClick={() => handleRemoveUnrankedItem(item.id)} />
                        ))}
                    </div>
                </section>
            )}

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

            {selectedTierIndex < 0 && tiers.length > 0 && (
                <div className="add-item-section">
                    <p className="add-item-hint">Select a tier to add items to it</p>
                </div>
            )}

            {tiers.length === 0 && (
                <div className="add-item-section">
                    <p className="add-item-hint">Create your first tier to start ranking items</p>
                </div>
            )}
        </main>
    );
}

export default EditListPage;
