'use client';

import {use, useEffect} from 'react';
import Link from 'next/link';
import { useVehicleCatalog } from '@/features/catalog/hooks/useVehicleCatalog';
import { ArrowLeft, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import CatalogTree from "@/features/catalog/components/CatalogTree";
import {saveArticleToPersonalCatalog} from "@/features/catalog/lib/saveToPersonalCatalog";
import {CarPartItem} from "@/types";
import {CatalogArticle} from "@/types/catalog/catalog";
import SaveToCatalogModal from "@/features/catalog/components/SaveToCatalogModal";

// Временно: получаем машину из localStorage (потом заменим на нормальный хук)
function getCarFromStorage(carId: string) {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('automate-garage');
        if (!raw) return null;
        const cars = JSON.parse(raw);
        return cars.find((c: any) => c.id === carId) || null;
    } catch {
        return null;
    }
}

function getPersonalParts(carId: string): CarPartItem[] {
    try {
        const raw = localStorage.getItem('automate-garage');
        if (!raw) return [];
        const cars = JSON.parse(raw);
        const car = cars.find((c: any) => c.id === carId);
        return car?.partsCatalog?.items || [];
    } catch {
        return [];
    }
}



export default function CatalogPage({
                                        params,
                                    }: {
    params: Promise<{ id: string }>;
}) {
    const { id: carId } = use(params);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    const [personalParts, setPersonalParts] = useState<CarPartItem[]>([]);

    const [articleToSave, setArticleToSave] = useState<CatalogArticle | null>(null);
    const [nodeNameToSave, setNodeNameToSave] = useState<string | undefined>();

    const car = getCarFromStorage(carId);

    const { catalog, isLoading, isFetching, refresh } = useVehicleCatalog({
        carId,
        vin: car?.vin,
        make: car?.make || '',
        model: car?.model || '',
        year: car?.year || 0,
        enabled: !!car,
    });

    // Загружаем личные запчасти при монтировании и после сохранения
    useEffect(() => {
        setPersonalParts(getPersonalParts(carId));
    }, [carId, toast]); // когда toast меняется — значит что-то сохранили

    if (!car) {
        return (
            <div className="p-6 text-center text-zinc-400">
                Машина не найдена
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
                Загружаем каталог...
            </div>
        );
    }

    if (!catalog) {
        return (
            <div className="p-6 text-center text-zinc-400">
                Не удалось загрузить каталог
            </div>
        );
    }

    // Фильтрация артикулов
    const filteredArticles = catalog.articles.filter((art) => {
        if (selectedNodeId && art.nodeId !== selectedNodeId) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            art.name.toLowerCase().includes(q) ||
            art.oem.toLowerCase().includes(q) ||
            (art.brand && art.brand.toLowerCase().includes(q))
        );
    });



    // Простой рендер дерева (без рекурсии пока)
    const renderNodes = (nodes: typeof catalog.nodes, level = 0) => {
        return nodes.map((node) => (
            <div key={node.id} style={{ marginLeft: level * 16 }}>
                <button
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition ${
                        selectedNodeId === node.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                >
                    {node.name}
                </button>
                {node.children && renderNodes(node.children, level + 1)}
            </div>
        ));
    };

    const isAlreadyAdded = (oem: string) => {
        return personalParts.some(
            (item) => item.oemNumber?.toLowerCase() === oem.toLowerCase()
        );
    };





    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={`/garage/${carId}`}
                            className="text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="font-semibold truncate">
                                Каталог · {car.make} {car.model}
                            </h1>
                            <p className="text-xs text-zinc-500">{car.year} г.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => refresh()}
                        disabled={isFetching}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50"
                        title="Обновить каталог"
                    >
                        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Поиск */}
                <div className="mt-3 relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        type="text"
                        placeholder="Поиск по названию или артикулу..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-zinc-600"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Дерево */}
                <aside className="md:w-72 border-b md:border-b-0 md:border-r border-zinc-800 p-4 overflow-y-auto max-h-[40vh] md:max-h-none">
                    <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
                        Разделы
                    </p>
                    <CatalogTree
                        nodes={catalog.nodes}
                        selectedNodeId={selectedNodeId}
                        onSelect={setSelectedNodeId}
                    />
                    {/*{renderNodes(catalog.nodes)}*/}
                </aside>

                {/* Список артикулов */}
                <main className="flex-1 p-4 md:p-6">
                    {/* Заголовок выбранного раздела */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-lg font-semibold">
                                {selectedNodeId
                                    ? (() => {
                                        // Ищем название узла (включая вложенные)
                                        const findNode = (nodes: typeof catalog.nodes): string | null => {
                                            for (const node of nodes) {
                                                if (node.id === selectedNodeId) return node.name;
                                                if (node.children) {
                                                    const found = findNode(node.children);
                                                    if (found) return found;
                                                }
                                            }
                                            return null;
                                        };
                                        return findNode(catalog.nodes) || 'Запчасти';
                                    })()
                                    : 'Все запчасти'}
                            </h2>
                            <p className="text-sm text-zinc-500 mt-0.5">
                                {filteredArticles.length}{' '}
                                {filteredArticles.length === 1
                                    ? 'позиция'
                                    : filteredArticles.length >= 2 && filteredArticles.length <= 4
                                        ? 'позиции'
                                        : 'позиций'}
                            </p>
                        </div>

                        {selectedNodeId && (
                            <button
                                onClick={() => setSelectedNodeId(null)}
                                className="text-sm text-zinc-400 hover:text-white transition"
                            >
                                Сбросить
                            </button>
                        )}
                    </div>

                    {/* Пустое состояние */}
                    {filteredArticles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                                <Search className="w-7 h-7 text-zinc-600" />
                            </div>
                            <p className="text-zinc-400 font-medium">Ничего не найдено</p>
                            <p className="text-sm text-zinc-600 mt-1">
                                {search
                                    ? 'Попробуйте изменить поисковый запрос'
                                    : 'В этом разделе пока нет запчастей'}
                            </p>
                            {(search || selectedNodeId) && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedNodeId(null);
                                    }}
                                    className="mt-5 text-sm text-blue-400 hover:text-blue-300"
                                >
                                    Показать все запчасти
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Список карточек */
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredArticles.map((art) => (
                                <div
                                    key={art.id}
                                    className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-all hover:bg-zinc-900/80"
                                >
                                    {/* Верхняя строка */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md">
              {art.oem}
            </span>
                                        {art.brand && (
                                            <span className="text-xs text-zinc-500 shrink-0">
                {art.brand}
              </span>
                                        )}
                                    </div>

                                    {/* Название */}
                                    <h3 className="font-medium text-[15px] leading-snug mb-1 group-hover:text-white transition">
                                        {art.name}
                                    </h3>

                                    {/* Примечание */}
                                    {art.note && (
                                        <p className="text-xs text-zinc-500 mb-3">{art.note}</p>
                                    )}

                                    {/* Нижняя часть */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/70">
                                        <div className="text-xs text-zinc-500">
                                            {art.quantity ? `${art.quantity} шт.` : '—'}
                                        </div>

                                        {isAlreadyAdded(art.oem) ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                В каталоге
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const findNodeName = (nodes: typeof catalog.nodes): string | undefined => {
                                                        for (const node of nodes) {
                                                            if (node.id === art.nodeId) return node.name;
                                                            if (node.children) {
                                                                const found = findNodeName(node.children);
                                                                if (found) return found;
                                                            }
                                                        }
                                                        return undefined;
                                                    };

                                                    setNodeNameToSave(findNodeName(catalog.nodes));
                                                    setArticleToSave(art);
                                                }}
                                                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition active:scale-95"
                                            >
                                                В мой каталог
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 text-white px-5 py-3 rounded-2xl shadow-lg text-sm animate-in fade-in">
                    {toast}
                </div>
            )}


            <SaveToCatalogModal
                open={!!articleToSave}
                article={articleToSave}
                nodeName={nodeNameToSave}
                onClose={() => setArticleToSave(null)}
                onConfirm={({ category, subcategory }) => {
                    if (!articleToSave) return;

                    const result = saveArticleToPersonalCatalog(carId, articleToSave, {
                        category,
                        subcategory,
                        nodeName: nodeNameToSave,
                    });

                    setToast(result.message);
                    setTimeout(() => setToast(null), 3000);
                    setArticleToSave(null);
                }}
            />
        </div>
    );
}