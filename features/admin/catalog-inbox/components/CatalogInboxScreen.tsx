'use client';

import * as React from 'react';
import { systemStore, InboxItem, StoredMasterModel } from '@/features/admin/lib/systemStore';
import { InboxHeader } from './InboxHeader';
import { CarInboxCard } from './CarInboxCard';
import { VinTrainingInboxCard } from './VinTrainingInboxCard';
import { PartInboxCard } from './PartInboxCard';
import { InboxEmptyState } from './InboxEmptyState';

export function CatalogInboxScreen() {
    const [items, setItems] = React.useState<InboxItem[]>([]);
    const [models, setModels] = React.useState<StoredMasterModel[]>([]);
    const [activeTab, setActiveTab] = React.useState<'all' | 'cars' | 'parts'>('all');

    const loadInbox = React.useCallback(() => {
        const state = systemStore.getState();
        setItems(state.inbox);
        setModels(state.masterModels);
    }, []);

    React.useEffect(() => {
        loadInbox();

        const onLocalUpdate = () => loadInbox();
        window.addEventListener('system-store-updated', onLocalUpdate);

        const onStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'bm_shared_system_state_v1') {
                loadInbox();
            }
        };
        window.addEventListener('storage', onStorageUpdate);

        return () => {
            window.removeEventListener('system-store-updated', onLocalUpdate);
            window.removeEventListener('storage', onStorageUpdate);
        };
    }, [loadInbox]);

    const handleApprove = (id: string, payload?: any) => {
        systemStore.approveInboxItem(id, payload);
    };

    const handleReject = (id: string) => {
        systemStore.resolveInboxItem(id);
    };

    const filteredItems = items.filter((item) => {
        if (activeTab === 'cars') return item.type === 'car_model';
        if (activeTab === 'parts') return item.type !== 'car_model';
        return true;
    });

    const carTicketsCount = items.filter((i) => i.type === 'car_model').length;
    const partTicketsCount = items.filter((i) => i.type !== 'car_model').length;

    return (
        <div className="space-y-6">
            <InboxHeader
                activeTab={activeTab}
                totalCount={items.length}
                carCount={carTicketsCount}
                partCount={partTicketsCount}
                onSelectTab={setActiveTab}
            />

            <div className="space-y-4">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) =>
                            item.vinTraining ? (
                                <VinTrainingInboxCard
                                    key={item.id}
                                    item={item}
                                    models={models}
                                    onReject={handleReject}
                                />
                            ) : item.type === 'car_model' ? (
                                <CarInboxCard
                                    key={item.id}
                                    item={item}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                />
                            ) : (
                                <PartInboxCard key={item.id} item={item} />
                            )
                        )}
                    </div>
                ) : (
                    <InboxEmptyState />
                )}
            </div>
        </div>
    );
}