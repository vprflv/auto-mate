'use client';

import * as React from 'react';
import { CarFront, X, Settings2 } from 'lucide-react';
import { InboxItem } from '@/features/admin/lib/systemStore';
import { Dialog } from 'radix-ui';
import type { ApproveCarModelPayload } from '@/features/admin/lib/system-store/actions/catalog';
import { CarModerationModal } from './CarModerationModal';

interface Props {
    item: InboxItem;
    onApprove: (id: string, payload?: ApproveCarModelPayload) => void;
    onReject: (id: string) => void;
}

export function CarInboxCard({ item, onApprove, onReject }: Props) {
    const specs = item.carSpecs || (item as InboxItem & { specs?: InboxItem['carSpecs'] }).specs || {};
    const [error, setError] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <>
            <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)]/40 bg-[var(--card)] transition-all duration-200 hover:border-[var(--link)]/40 hover:shadow-sm">
                {/* Верхний блок превью */}
                <div className="relative flex h-32 w-full flex-col items-center justify-center border-b border-[var(--border)]/30 bg-[var(--bg-elevated)]/60 p-3 text-center">
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                        <CarFront className="h-3 w-3" />
                        {item.catalogCheck ? 'Каталог открыт' : item.vinMismatch ? 'Расхождение по VIN' : 'Новое авто'}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--text-muted)] shadow-2xs border border-[var(--border)]/40">
                        <CarFront className="h-6 w-6 stroke-[1.5]" />
                    </div>

                    <p className="mt-2 text-xs text-[var(--text-dim)]">от {item.submittedBy}</p>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
                    <div className="space-y-2">
                        <div>
                            <h4 className="truncate text-base font-bold text-[var(--text)]" title={`${item.carBrand} ${item.carModel}`}>
                                {item.carBrand} {item.carModel}
                            </h4>
                            <p className="truncate text-xs font-medium text-[var(--text-muted)]">
                                {item.carYear || ('year' in specs ? specs.year : undefined) || 'Год не указан'}
                            </p>
                        </div>

                        {/* Сырые данные пользователя */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px]">
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                ДВС: <span className="font-semibold text-[var(--text)]">{specs?.displacementL ? `${specs.displacementL} л` : item.engine || '—'}</span>
                            </div>
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                КПП: <span className="font-semibold text-[var(--text)]">{specs?.transmission || '—'}</span>
                            </div>
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-muted)] border border-[var(--border)]/40">
                                Комп.: <span className="font-semibold text-[var(--text)]">{specs?.trim || '—'}</span>
                            </div>
                            <div className="truncate rounded-md bg-[var(--bg-elevated)] px-2 py-1 font-mono text-[var(--text-muted)] border border-[var(--border)]/40" title={specs?.vin}>
                                VIN: <span className="font-semibold text-[var(--text)]">{specs?.vin ? specs.vin.slice(-6) : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="mt-2 flex items-center gap-2 border-t border-[var(--border)]/40 pt-3">
                        <button
                            type="button"
                            onClick={() => onReject(item.id)}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                            title={item.vinMismatch?.catalogOpen ? "Отклонить заявку о расхождении" : "Отклонить как мусор"}
                        >
                            <X className="h-3.5 w-3.5" />
                            Отклонить
                        </button>

                        <button
                            type="button"
                            onClick={() => { setError(''); setIsModalOpen(true); }}
                            className="flex h-8 flex-[1.2] items-center justify-center gap-1 rounded-xl bg-[var(--link)] text-xs font-bold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] shadow-2xs"
                            title="Открыть пульт модерации"
                        >
                            <Settings2 className="h-3.5 w-3.5" />
                            Модерировать
                        </button>
                    </div>
                </div>
            </div>

            {/* Вызов нашей PIM-модалки */}
            {item.catalogCheck ? (
                <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--text)]">
                            <Dialog.Title className="text-lg font-semibold">Проверка привязки к ИИ-каталогу</Dialog.Title>
                            <Dialog.Description className="text-sm text-[var(--text-muted)]">Каталог уже открыт. Закрытие проверки сохраняет выбор пользователя.</Dialog.Description>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                                <dt className="text-[var(--text-muted)]">Автомобиль</dt><dd>{item.carBrand} {item.carModel} · {item.carYear}</dd>
                                <dt className="text-[var(--text-muted)]">Карточка</dt><dd>{item.catalogCheck.name}</dd>
                                {specs.vin && <><dt className="text-[var(--text-muted)]">VIN</dt><dd>{specs.vin}</dd></>}
                                {specs.frameNumber && <><dt className="text-[var(--text-muted)]">Frame</dt><dd>{specs.frameNumber}</dd></>}
                                {item.engine && <><dt className="text-[var(--text-muted)]">Двигатель</dt><dd>{item.engine}</dd></>}
                                {specs.transmission && <><dt className="text-[var(--text-muted)]">КПП</dt><dd>{specs.transmission}</dd></>}
                            </dl>
                            {item.catalogCheck.differences.length ? <ul className="list-disc space-y-1 pl-5 text-sm">
                                {item.catalogCheck.differences.map(difference => <li key={difference}>{difference}</li>)}
                            </ul> : <p className="text-sm">Расхождений в указанных данных нет.</p>}
                            {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
                            <div className="flex flex-wrap justify-end gap-2">
                                <Dialog.Close className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">Назад</Dialog.Close>
                                <button type="button" className="rounded-lg bg-[var(--link)] px-3 py-2 text-sm font-semibold text-[var(--btn-primary-text)]" onClick={() => {
                                    try {
                                        onApprove(item.id);
                                        setIsModalOpen(false);
                                    } catch (caught) {
                                        setError(caught instanceof Error ? caught.message : 'Не удалось закрыть проверку.');
                                    }
                                }}>Завершить проверку</button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            ) : <CarModerationModal
                item={item}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={(id, payload) => {
                    onApprove(id, payload);
                    setIsModalOpen(false);
                }}
                onReject={(id) => {
                    setIsModalOpen(false);
                    onReject(id);
                }}
            />}
        </>
    );
}
