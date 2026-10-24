import * as React from 'react';
import { Settings2 } from 'lucide-react';

interface NodeEditorBlockProps {
    nodeCategory: string;
    setNodeCategory: (value: string) => void;
    nodeTitle: string;
    setNodeTitle: (value: string) => void;
    existingNodes: string[];
    isCustomNode: boolean;
    setIsCustomNode: (value: boolean) => void;
}

export function NodeEditorBlock({
                                    nodeCategory, setNodeCategory,
                                    nodeTitle, setNodeTitle,
                                    existingNodes,
                                    isCustomNode, setIsCustomNode
                                }: NodeEditorBlockProps) {

    // Умное переключение: если узлов в категории нет, принудительно открываем текстовое поле.
    // Если узлы есть, выбираем первый из списка по умолчанию.
    React.useEffect(() => {
        if (existingNodes.length === 0) {
            setIsCustomNode(true);
        } else if (!isCustomNode && !existingNodes.includes(nodeTitle)) {
            setNodeTitle(existingNodes[0] || '');
        }
    }, [existingNodes]); // Запускаем только при смене списка узлов (при смене категории)

    return (
        <div className="space-y-3 rounded-2xl border border-[var(--border)]/40 bg-[var(--bg-elevated)]/40 p-5 mt-4">
            <p className="text-[10px] font-bold uppercase text-[var(--text-dim)] flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5" /> Дерево каталога
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Категория</label>
                    <select
                        value={nodeCategory}
                        onChange={(e) => {
                            setNodeCategory(e.target.value);
                            setIsCustomNode(false); // При смене категории пробуем вернуться к выбору из списка
                        }}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                    >
                        <option value="service">Расходники ТО</option>
                        <option value="brakes">Тормозная система</option>
                        <option value="suspension">Подвеска и рулевое</option>
                        <option value="fluids">Масла и жидкости</option>
                        <option value="ignition">Зажигание / Электрика</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Название узла</label>
                    <div className="space-y-2">
                        {/* Выпадающий список существующих узлов */}
                        <select
                            value={isCustomNode ? '__CUSTOM__' : nodeTitle}
                            onChange={(e) => {
                                if (e.target.value === '__CUSTOM__') {
                                    setIsCustomNode(true);
                                    setNodeTitle(''); // Очищаем поле для ручного ввода
                                } else {
                                    setIsCustomNode(false);
                                    setNodeTitle(e.target.value);
                                }
                            }}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--link)]"
                        >
                            {existingNodes.map(title => (
                                <option key={title} value={title}>{title}</option>
                            ))}
                            <option value="__CUSTOM__">➕ Создать новый узел</option>
                        </select>

                        {/* Поле для ввода нового узла */}
                        {isCustomNode && (
                            <input
                                value={nodeTitle}
                                onChange={(e) => setNodeTitle(e.target.value)}
                                placeholder="Напр: Колодки передние..."
                                className="w-full rounded-xl border border-[var(--link)]/50 bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--link)] focus:ring-1 focus:ring-[var(--link)]/20 animate-in fade-in slide-in-from-top-1"
                                autoFocus
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}