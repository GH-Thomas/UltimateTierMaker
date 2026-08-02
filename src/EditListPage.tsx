import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateItemDialog, CreateItemSourceDialog, CreateTierDialog } from './components/CreateDialogs';
import { useTierList } from './hooks/useTierList';
import Item from './components/Item';
import Tier from './components/Tier';

const TIER_COLORS = ['#ff7e6b', '#ffb86b', '#ffe96b', '#9ad26d', '#6cc7b8', '#79ace9'];

function EditListPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tierList, itemSources, isLoading, error, uploadImage, createTier, createItem, createItemSource, deleteItem } = useTierList(id);
    const [selectedTierIndex, setSelectedTierIndex] = useState(-1);
    const [isCreateTierDialogOpen, setIsCreateTierDialogOpen] = useState(false);
    const [isCreateItemDialogOpen, setIsCreateItemDialogOpen] = useState(false);
    const [isCreateItemSourceDialogOpen, setIsCreateItemSourceDialogOpen] = useState(false);
    const [tierDialogVersion, setTierDialogVersion] = useState(0);
    const [itemDialogVersion, setItemDialogVersion] = useState(0);
    const [itemSourceDialogVersion, setItemSourceDialogVersion] = useState(0);

    const handleTierSelect = useCallback((index: number) => {
        setSelectedTierIndex(index);
    }, []);

    const handleCreateTier = useCallback(async (payload: Parameters<typeof createTier>[0]) => {
        try {
            const createdTier = await createTier(payload);
            const nextTierIndex = [...(tierList?.tiers ?? []), createdTier]
                .sort((leftTier, rightTier) => {
                    const orderDifference = leftTier.order - rightTier.order;
                    if (orderDifference !== 0) {
                        return orderDifference;
                    }

                    return leftTier.rank - rightTier.rank;
                })
                .findIndex((tier) => tier.id === createdTier.id);
            setSelectedTierIndex(nextTierIndex);
        } catch (error) {
            console.error('Failed to add tier', error);
        }
    }, [createTier, tierList]);

    const handleCreateItem = useCallback(async (payload: Parameters<typeof createItem>[0]) => {
        try {
            await createItem(payload);
        } catch (error) {
            console.error('Failed to add item', error);
        }
    }, [createItem]);

    const handleCreateItemSource = useCallback(async (payload: Parameters<typeof createItemSource>[0]) => {
        try {
            await createItemSource(payload);
        } catch (error) {
            console.error('Failed to add item source', error);
        }
    }, [createItemSource]);

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

            <div className="page-actions">
                <button className="add-tier-button" onClick={() => {
                    setTierDialogVersion((currentVersion) => currentVersion + 1);
                    setIsCreateTierDialogOpen(true);
                }} type="button">
                    Create Tier
                </button>
                <button className="add-item-button" onClick={() => {
                    setItemDialogVersion((currentVersion) => currentVersion + 1);
                    setIsCreateItemDialogOpen(true);
                }} type="button">
                    Create Item
                </button>
                <button className="dialog-secondary-button page-action-secondary" onClick={() => {
                    setItemSourceDialogVersion((currentVersion) => currentVersion + 1);
                    setIsCreateItemSourceDialogOpen(true);
                }} type="button">
                    Create Item Source
                </button>
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
                    <p className="add-item-hint">Click items to remove them. Use Create Item to customize the full payload.</p>
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

            <section className="source-section">
                <div className="source-section-header">
                    <h2 className="unranked-title">Item Sources</h2>
                    <span className="source-count">{itemSources.length} source{itemSources.length === 1 ? '' : 's'}</span>
                </div>
                {itemSources.length === 0 ? (
                    <p className="add-item-hint">No item sources yet. Create one to reuse it across items.</p>
                ) : (
                    <div className="source-grid">
                        {itemSources.map((source) => (
                            <article className="source-card" key={source.id}>
                                <h3 className="source-card-title">{source.name}</h3>
                                {source.description && <p className="source-card-copy">{source.description}</p>}
                                {source.link && (
                                    <a className="source-card-link" href={source.link} rel="noreferrer" target="_blank">
                                        {source.link}
                                    </a>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <CreateTierDialog
                key={tierDialogVersion}
                isOpen={isCreateTierDialogOpen}
                onClose={() => setIsCreateTierDialogOpen(false)}
                defaultRank={tiers.length}
                onSubmit={handleCreateTier}
                onUploadImage={uploadImage}
            />
            <CreateItemDialog
                key={itemDialogVersion}
                isOpen={isCreateItemDialogOpen}
                onClose={() => setIsCreateItemDialogOpen(false)}
                tiers={tiers}
                itemSources={itemSources}
                defaultTierId={selectedTier?.id}
                onSubmit={handleCreateItem}
                onUploadImage={uploadImage}
            />
            <CreateItemSourceDialog
                key={itemSourceDialogVersion}
                isOpen={isCreateItemSourceDialogOpen}
                onClose={() => setIsCreateItemSourceDialogOpen(false)}
                onSubmit={handleCreateItemSource}
                onUploadImage={uploadImage}
            />
        </main>
    );
}

export default EditListPage;
