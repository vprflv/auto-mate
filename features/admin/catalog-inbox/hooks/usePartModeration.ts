import * as React from 'react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { storage } from '@/features/admin/lib/system-store/storage';
import { StoredMasterModel } from '@/features/admin/lib/system-store/types';

interface UsePartModerationProps {
    item: InboxItem;
    isOpen: boolean;
    onApprove: (id: string, payload: any) => void;
    onReject: (id: string) => void;
}

export function usePartModeration({ item, isOpen, onApprove, onReject }: UsePartModerationProps) {
    const initialBrand = item.partBrand || item.partSpecs?.brand || (item as any).specs?.brand || '';
    const initialArticle = item.partArticle || item.partSpecs?.article || (item as any).specs?.article || '';
    const initialName = item.partName || item.partSpecs?.name || (item as any).specs?.name || '';
    const initialIsOem = item.isOem ?? item.partSpecs?.isOem ?? (item as any).specs?.isOem ?? false;

    const [targetCar, setTargetCar] = React.useState<StoredMasterModel | null>(null);

    const [brand, setBrand] = React.useState<string>(initialBrand);
    const [article, setArticle] = React.useState<string>(initialArticle);
    const [name, setName] = React.useState<string>(initialName);
    const [isOem, setIsOem] = React.useState<boolean>(initialIsOem);
    const [oemCross, setOemCross] = React.useState<string>('');

    const [nodeCategory, setNodeCategory] = React.useState<string>('service');
    const [nodeTitle, setNodeTitle] = React.useState<string>('');
    const [isCustomNode, setIsCustomNode] = React.useState<boolean>(false); // <-- НОВЫЙ СТЕЙТ

    const [compatibilityType, setCompatibilityType] = React.useState<'all' | 'specific'>('all');
    const [selectedModIds, setSelectedModIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const state = storage.getState();
            const car = state.masterModels.find(
                m => m.brandName.toLowerCase() === (item.carBrand || '').toLowerCase() &&
                    m.modelName.toLowerCase() === (item.carModel || '').toLowerCase()
            );
            setTargetCar(car || null);
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, item]);

    // АВТОПОДБОР СУЩЕСТВУЮЩИХ УЗЛОВ
    const existingNodes = React.useMemo(() => {
        const state = storage.getState();
        const bSlug = (item.carBrand || '').toLowerCase().replace(/\s+/g, '-');
        const mSlug = (item.carModel || '').toLowerCase().replace(/\s+/g, '-');

        const nodes = state.catalogNodes.filter(n =>
            n.brandSlug === bSlug &&
            n.modelSlug === mSlug &&
            n.category === nodeCategory
        );

        return Array.from(new Set(nodes.map(n => n.title)));
    }, [item.carBrand, item.carModel, nodeCategory, isOpen]);

    const handleApprove = () => {
        const payload = {
            part: {
                brand: brand.trim(),
                article: article.trim(),
                name: name.trim(),
                isOem,
                oemCross: oemCross.trim()
            },
            node: {
                category: nodeCategory,
                title: nodeTitle.trim() || name.trim()
            },
            compatibleModifications: compatibilityType === 'all' ? ['all'] : selectedModIds
        };
        onApprove(item.id, payload);
    };

    const handleReject = () => onReject(item.id);

    return {
        incomingData: { brand: initialBrand, article: initialArticle, name: initialName },
        targetCar,
        brand, setBrand,
        article, setArticle,
        name, setName,
        isOem, setIsOem,
        oemCross, setOemCross,

        nodeCategory, setNodeCategory,
        nodeTitle, setNodeTitle,
        existingNodes,
        isCustomNode, setIsCustomNode, // <-- ПРОКИДЫВАЕМ

        compatibilityType, setCompatibilityType,
        selectedModIds, setSelectedModIds,
        handleApprove, handleReject
    };
}