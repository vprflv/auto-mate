'use client';

import * as React from 'react';
import { FolderTree, Plus } from 'lucide-react';
import { ADMIN_CATALOG_CATEGORIES } from '../../lib/partInboxUtils';

interface Props {
    itemId: string;
    selectedCategory: string;
    onSelectCategory: (v: string) => void;
    isCustomCat: boolean;
    onToggleCustomCat: () => void;
    customCatName: string;
    onChangeCustomCatName: (v: string) => void;
    nodeTitle: string;
    onChangeNodeTitle: (v: string) => void;
    existingNodeTitles: string[];
    fullEngineTag: string;
    engineScope: 'specific' | 'all';
    onChangeEngineScope: (v: 'specific' | 'all') => void;
}

export function PartCatalogTargetSection({
                                             itemId,
                                             selectedCategory,
                                             onSelectCategory,
                                             isCustomCat,
                                             onToggleCustomCat,
                                             customCatName,
                                             onChangeCustomCatName,
                                             nodeTitle,
                                             onChangeNodeTitle,
                                             existingNodeTitles,
                                             fullEngineTag,
                                             engineScope,
                                             onChangeEngineScope,
                                         }: Props) {
    const datalistId = `nodes-list-${itemId}`;

    return (
        <div className="space-y-1.5 rounded-xl border border-[var(--border)]/50 bg-[var(--bg-elevated)]/40 p-2">
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                    <FolderTree className="h-2.5 w-2.5" />
                    Раздел каталога
                </span>
                <button
                    type="button"
                    onClick={onToggleCustomCat}
                    className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[var(--link)] hover:underline"
                >
                    <Plus className="h-2 w-2" />
                    {isCustomCat ? 'Список' : 'Своя'}
                </button>
            </div>

            {isCustomCat ? (
                <input
                    type="text"
                    value={customCatName}
                    onChange={(e) => onChangeCustomCatName(e.target.value)}
                    placeholder="Новая категория..."
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                />
            ) : (
                <select
                    value={selectedCategory}
                    onChange={(e) => onSelectCategory(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                >
                    {ADMIN_CATALOG_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            )}

            {/* Узел с автодополнением и быстрыми чипами */}
            <div>
                <input
                    type="text"
                    list={datalistId}
                    value={nodeTitle}
                    onChange={(e) => onChangeNodeTitle(e.target.value)}
                    placeholder="Узел (напр.: Масляный фильтр)..."
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--text)] outline-none focus:border-[var(--btn-primary)]"
                />
                <datalist id={datalistId}>
                    {existingNodeTitles.map((title) => (
                        <option key={title} value={title} />
                    ))}
                </datalist>

                {existingNodeTitles.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {existingNodeTitles.slice(0, 4).map((title) => {
                            const isSelected =
                                nodeTitle.trim().toLowerCase() === title.toLowerCase();
                            return (
                                <button
                                    key={title}
                                    type="button"
                                    onClick={() => onChangeNodeTitle(title)}
                                    className={[
                                        'rounded px-1.5 py-0.5 text-[9px] font-medium transition border',
                                        isSelected
                                            ? 'bg-[var(--link)]/15 text-[var(--link)] border-[var(--link)]/40 font-bold'
                                            : 'bg-[var(--card)] text-[var(--text-dim)] border-[var(--border)]/50 hover:text-[var(--text)]',
                                    ].join(' ')}
                                >
                                    {title}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Привязка к модификации ДВС */}
            {fullEngineTag && (
                <div className="pt-1 border-t border-[var(--border)]/40 flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold uppercase text-[var(--text-dim)]">
                        Модификация:
                    </span>
                    <div className="flex items-center rounded-md bg-[var(--card)] p-0.5 border border-[var(--border)]/50">
                        <button
                            type="button"
                            onClick={() => onChangeEngineScope('specific')}
                            className={[
                                'rounded px-1.5 py-0.5 text-[9px] font-bold transition truncate max-w-[110px]',
                                engineScope === 'specific'
                                    ? 'bg-amber-500 text-white'
                                    : 'text-[var(--text-dim)] hover:text-[var(--text)]',
                            ].join(' ')}
                            title={`Привязать только к ${fullEngineTag}`}
                        >
                            Только {fullEngineTag}
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangeEngineScope('all')}
                            className={[
                                'rounded px-1.5 py-0.5 text-[9px] font-bold transition',
                                engineScope === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-[var(--text-dim)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            Все ДВС
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}