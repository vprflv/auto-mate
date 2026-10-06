'use client';

import { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
} from 'lucide-react';

import { CatalogNode } from '@/types/catalog/catalog';

type Props = {
    nodes: CatalogNode[];
    selectedNodeId: string | null;
    onSelect: (nodeId: string | null) => void;
};

type TreeNodeProps = {
    node: CatalogNode;
    level: number;
    selectedNodeId: string | null;
    onSelect: (nodeId: string | null) => void;
};

function TreeNode({
                      node,
                      level,
                      selectedNodeId,
                      onSelect,
                  }: TreeNodeProps) {
    const [isOpen, setIsOpen] =
        useState(level < 1);

    const hasChildren =
        node.children &&
        node.children.length > 0;

    const isSelected =
        selectedNodeId === node.id;

    return (
        <div>
            <div
                className={`flex items-center gap-1 rounded-lg transition-colors ${
                    isSelected
                        ? 'bg-[var(--link)] text-[var(--btn-primary-text)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]'
                }`}
                style={{
                    paddingLeft:
                        8 + level * 14,
                }}
            >
                {/* Стрелка */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();

                        if (hasChildren) {
                            setIsOpen(
                                (prev) => !prev
                            );
                        }
                    }}
                    className={`flex h-8 w-6 shrink-0 items-center justify-center ${
                        hasChildren
                            ? 'opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                >
                    {isOpen ? (
                        <ChevronDown
                            size={16}
                        />
                    ) : (
                        <ChevronRight
                            size={16}
                        />
                    )}
                </button>

                {/* Название узла */}
                <button
                    type="button"
                    onClick={() =>
                        onSelect(node.id)
                    }
                    className="flex-1 truncate py-2 pr-3 text-left text-sm"
                >
                    {node.name}
                </button>
            </div>

            {/* Дети */}
            {hasChildren &&
                isOpen && (
                    <div>
                        {node.children!.map(
                            (child) => (
                                <TreeNode
                                    key={
                                        child.id
                                    }
                                    node={
                                        child
                                    }
                                    level={
                                        level +
                                        1
                                    }
                                    selectedNodeId={
                                        selectedNodeId
                                    }
                                    onSelect={
                                        onSelect
                                    }
                                />
                            )
                        )}
                    </div>
                )}
        </div>
    );
}

export default function CatalogTree({
                                        nodes,
                                        selectedNodeId,
                                        onSelect,
                                    }: Props) {
    return (
        <div className="space-y-0.5">
            {nodes.map((node) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    selectedNodeId={
                        selectedNodeId
                    }
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}