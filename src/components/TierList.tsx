import { useCallback, useEffect, useMemo, useState } from 'react';
import { createDefaultTierList, type TierList as TierListModel } from '../domain/tierList';
import { tierListRepository } from '../repositories/IndexedDbTierListRepository';
import Tier from './Tier';

const TIER_COLORS = ['#ff7e6b', '#ffb86b', '#ffe96b', '#9ad26d', '#6cc7b8', '#79ace9'];

function TierList() {
    const [tierLists, setTierLists] = useState<TierListModel[]>([]);
    const [activeTierListId, setActiveTierListId] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

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

                if (!isMounted) {
                    return;
                }

                setTierLists(loadedTierLists);
                setActiveTierListId(loadedTierLists[0]?.id ?? null);
            } catch (error) {
                console.error('Failed to initialize tier lists', error);
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

    const activeTierList = useMemo(() => {
        if (!activeTierListId) {
            return null;
        }

        return tierLists.find((list) => list.id === activeTierListId) ?? null;
    }, [activeTierListId, tierLists]);

    const tiers = activeTierList?.tiers ?? [];

    const handleTierSelect = useCallback((index: number) => {
        setSelectedIndex(index);
    }, []);

    const handleItemClick = useCallback((itemLabel: string) => {
        console.log(`Clicked item: ${itemLabel}`);
    }, []);

    if (isLoading) {
        return <p className="tier-list-loading">Loading tier lists...</p>;
    }

    return (
        <main className="tier-list-container">
            <h1 className="tier-list-title">{activeTierList?.name ?? 'Tier List'}</h1>
            {tiers.length === 0 && <p>No tiers available.</p>}

            <div className="tier-list-board">
                {tiers.map((tier, index) => (
                    <Tier
                        key={tier.id}
                        tier={tier}
                        color={TIER_COLORS[index % TIER_COLORS.length]}
                        isSelected={selectedIndex === index}
                        onSelect={() => handleTierSelect(index)}
                        onItemClick={(item) => handleItemClick(item.label)}
                    />
                ))}
            </div>
        </main>
    );
}

export default TierList;