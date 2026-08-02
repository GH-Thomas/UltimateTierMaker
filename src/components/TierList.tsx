import { useCallback, useMemo, useState } from 'react';
import { useTierLists } from '../hooks/useTierLists';
import Tier from './Tier';

const TIER_COLORS = ['#ff7e6b', '#ffb86b', '#ffe96b', '#9ad26d', '#6cc7b8', '#79ace9'];

function TierList() {
    const { tierLists, isLoading } = useTierLists();
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const activeTierList = useMemo(() => {
        return tierLists[0] ?? null;
    }, [tierLists]);

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