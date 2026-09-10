'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import {CatalogNode} from "@/types/catalog/catalog";


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

function TreeNode({ node, level, selectedNodeId, onSelect }: TreeNodeProps) {
    const [isOpen, setIsOpen] = useState(level < 1); // первый уровень открыт по умолчанию
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodeId === node.id;

    return (
        <div>
            <div
                className={`flex items-center gap-1 rounded-lg transition ${
                    isSelected
                        ? 'bg-[#39FF14] text-black'
                        : 'hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
                style={{ paddingLeft: 8 + level * 14 }}
            >
                {/* Стрелка */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) setIsOpen((prev) => !prev);
                    }}
                    className={`w-6 h-8 flex items-center justify-center shrink-0 ${
                        hasChildren ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    {isOpen ? (
                        <ChevronDown size={16} />
                    ) : (
                        <ChevronRight size={16} />
                    )}
                </button>

                {/* Название узла */}
                <button
                    type="button"
                    onClick={() => onSelect(node.id)}
                    className="flex-1 text-left py-2 pr-3 text-sm truncate"
                >
                    {node.name}
                </button>
            </div>

            {/* Дети */}
            {hasChildren && isOpen && (
                <div>
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedNodeId={selectedNodeId}
                            onSelect={onSelect}
                        />
                    ))}
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
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}