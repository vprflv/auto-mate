'use client';

import * as React from 'react';
import { systemStore } from '@/features/admin/lib/systemStore';
import { defaultBaseCatalogs } from './data/defaultBaseCatalogs';
import { BrandCatalog } from './types';
import { CatalogHeader } from './components/CatalogHeader';
import { CatalogSearch } from './components/CatalogSearch';
import { AlphabetFilter } from './components/AlphabetFilter';
import { BrandCard } from './components/BrandCard';
import { CatalogEmptyState } from './components/CatalogEmptyState';
import {CatalogPartSearch} from "@/features/admin/catalog/components/CatalogPartSearch";
import {useRouter} from "next/navigation";
import {AddCatalogModelForm} from "@/features/admin/catalog/components/AddCatalogModelForm";
import {downloadCatalogSnapshot} from "@/features/admin/catalog/lib/catalogSnapshot";

export default function AdminCatalogIndexPage() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedLetter, setSelectedLetter] = React.useState<string>('all');
    const [inboxCount, setInboxCount] = React.useState(0);
    const [catalogs, setCatalogs] = React.useState<BrandCatalog[]>(defaultBaseCatalogs);

    const [isAddModelOpen, setIsAddModelOpen] = React.useState(false);

    const loadData = React.useCallback(() => {
        const state = systemStore.getState();
        setInboxCount(state.inbox.length);
        setInboxCount(state.inbox.length);

        const brandMap = new Map<string, BrandCatalog>();

        state.masterModels.forEach((m) => {
            if (!brandMap.has(m.brandSlug)) {
                brandMap.set(m.brandSlug, {
                    brand: m.brandName,
                    slug: m.brandSlug,
                    models: [],
                });
            }

            const brandEntry = brandMap.get(m.brandSlug)!;

            // Находим все узлы для этой конкретной модели
            const relatedNodes = state.catalogNodes.filter(
                (n) => n.brandSlug === m.brandSlug && n.modelSlug === m.modelSlug
            );

            // Считаем общее количество запчастей
            const totalParts = relatedNodes.reduce((acc, n) => acc + n.items.length, 0);

            // Считаем количество ВЕРИФИЦИРОВАННЫХ запчастей
            const verifiedParts = relatedNodes.reduce((acc, n) => {
                return acc + n.items.filter((item) => item.isVerified).length;
            }, 0);

            // Высчитываем реальный процент доверия базе
            const calculatedPercent = totalParts > 0
                ? Math.round((verifiedParts / totalParts) * 100)
                : 0;

            brandEntry.models.push({
                slug: m.modelSlug,
                name: m.modelName,
                years: m.years,
                partsCount: totalParts,
                verifiedPercent: calculatedPercent, // Теперь здесь честная математика!
            });
        });

        const sorted = Array.from(brandMap.values()).sort((a, b) =>
            a.brand.localeCompare(b.brand, 'ru', { sensitivity: 'base' })
        );

        sorted.forEach((brand) => {
            brand.models.sort((a, b) =>
                a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })
            );
        });

        setCatalogs(sorted);
    }, []);

    React.useEffect(() => {
        loadData();

        const onLocalUpdate = () => loadData();
        window.addEventListener('system-store-updated', onLocalUpdate);

        const onStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'bm_shared_system_state_v1') {
                loadData();
            }
        };
        window.addEventListener('storage', onStorageUpdate);

        return () => {
            window.removeEventListener('system-store-updated', onLocalUpdate);
            window.removeEventListener('storage', onStorageUpdate);
        };
    }, [loadData]);

    const availableLetters = React.useMemo(() => {
        const letters = new Set<string>();
        catalogs.forEach((c) => {
            const first = c.brand.charAt(0).toUpperCase();
            if (first) letters.add(first);
        });
        return Array.from(letters).sort();
    }, [catalogs]);

    const filteredCatalogs = React.useMemo(() => {
        let result = catalogs;

        if (selectedLetter !== 'all') {
            result = result.filter(
                (cat) => cat.brand.charAt(0).toUpperCase() === selectedLetter
            );
        }

        const query = searchQuery.trim().toLowerCase();
        if (query) {
            result = result
                .map((cat) => {
                    const matchBrand = cat.brand.toLowerCase().includes(query);
                    const matchedModels = cat.models.filter((m) =>
                        m.name.toLowerCase().includes(query)
                    );

                    if (matchBrand) return cat;
                    if (matchedModels.length > 0) {
                        return { ...cat, models: matchedModels };
                    }
                    return null;
                })
                .filter(Boolean) as BrandCatalog[];
        }

        return result;
    }, [catalogs, selectedLetter, searchQuery]);

    const groupedByLetter = React.useMemo(() => {
        const groups: Record<string, BrandCatalog[]> = {};
        filteredCatalogs.forEach((cat) => {
            const letter = cat.brand.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(cat);
        });
        return groups;
    }, [filteredCatalogs]);

    return (
        <div className="space-y-6">
            <CatalogHeader inboxCount={inboxCount} />

            {isAddModelOpen ? (
                <AddCatalogModelForm
                    onCancel={() => setIsAddModelOpen(false)}
                    onCreated={model => {
                        setIsAddModelOpen(false);
                        router.push(
                            `/admin/catalog/${encodeURIComponent(model.brandSlug)}/${encodeURIComponent(model.modelSlug)}`
                        );
                    }}
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setIsAddModelOpen(true)}
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                >
                    Добавить модель
                </button>
            )}

            <CatalogSearch value={searchQuery} onChange={setSearchQuery} />

            <button
                type="button"
                onClick={downloadCatalogSnapshot}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--link)] hover:text-[var(--link)]"
            >
                Скачать базу каталога
            </button>

            <CatalogPartSearch />
            <AlphabetFilter
                availableLetters={availableLetters}
                selectedLetter={selectedLetter}
                onSelectLetter={setSelectedLetter}
            />

            <div className="space-y-8">
                {Object.keys(groupedByLetter).length > 0 ? (
                    Object.entries(groupedByLetter).map(([letter, brandList]) => (
                        <div key={letter} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg-elevated)] font-bold text-sm text-[var(--text)] border border-[var(--border)]">
                                    {letter}
                                </span>
                                <div className="h-px flex-1 bg-[var(--border)]/60" />
                            </div>

                            <div className="space-y-4">
                                {brandList.map((cat) => (
                                    <BrandCard key={cat.slug} catalog={cat} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <CatalogEmptyState />
                )}
            </div>
        </div>
    );
}