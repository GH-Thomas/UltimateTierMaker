export interface ImageRef {
    id: string;
}

export interface ItemSourceRef {
    id: string;
}

export interface ItemSource {
    id: string;
    name: string;
    description?: string | null;
    image?: ImageRef | null;
    link?: string | null;
    tierListId: string;
}

export interface Item {
    id: string;
    label: string;
    imageUrl?: string;
    nicknames: string[];
    image?: ImageRef | null;
    backgroundImage?: ImageRef | null;
    source?: ItemSource | null;
    description?: string | null;
    tierId?: string | null;
    order: number;
}

export interface Tier {
    id: string;
    name: string;
    rank: number;
    items: Item[];
    tierImage?: ImageRef | null;
    tierColor?: string | null;
    backgroundImage?: ImageRef | null;
    backgroundColor?: string | null;
    tierSize: number;
    tierSymbol?: ImageRef | null;
    order: number;
}

export interface TierList {
    id: string;
    name: string;
    tiers: Tier[];
    unrankedItems: Item[];
    image?: ImageRef | null;
    backgroundImage?: ImageRef | null;
    backgroundColor?: string | null;
    description?: string | null;
    tierSpacing: number;
    createdAt: string;
    updatedAt: string;
}