export interface PartItem {
    id: string;
    brand: string;
    article: string;
    name: string;
    isOem: boolean;
    isVerified?: boolean;
    installationsCount: number;
    compatibilityScore: number;
    priceRange?: string;
    note?: string;
}

export interface AssemblyNode {
    id: string;
    title: string;
    category: 'service' | 'brakes' | 'suspension' | 'ignition' | 'fluids';
    engineCompatibility: string[];
    items: PartItem[];
}