export interface Item {
    id: string;
    label: string;
    imageUrl?: string;
}

export interface Tier {
    id: string;
    name: string;
    rank: number;
    items: Item[];
}

export interface TierList {
    id: string;
    name: string;
    tiers: Tier[];
    createdAt: string;
    updatedAt: string;
}

function createTier(name: string, rank: number): Tier {
    return {
        id: crypto.randomUUID(),
        name,
        rank,
        items: [],
    };
}

function createItem(label: string, seed: string): Item {
    return {
        id: crypto.randomUUID(),
        label,
        imageUrl: `https://picsum.photos/seed/${seed}/144`,
    };
}

export function createDefaultTierList(): TierList {
    const now = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        name: 'My First Tier List',
        tiers: [
            {
                ...createTier('SS', 0),
                items: [
                    createItem('Dragon Slayer', 'dragon-slayer'),
                    createItem('Aether Knight', 'aether-knight'),
                ],
            },
            {
                ...createTier('S', 1),
                items: [
                    createItem('Frost Archer', 'frost-archer'),
                    createItem('Blaze Monk', 'blaze-monk'),
                ],
            },
            {
                ...createTier('A', 2),
                items: [
                    createItem('Stone Warden', 'stone-warden'),
                ],
            },
            createTier('B', 3),
        ],
        createdAt: now,
        updatedAt: now,
    };
}