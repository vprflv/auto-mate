'use client';

import { storage } from './system-store/storage';
import { SystemState } from './system-store/types';
import { createUser } from './system-store/actions/users';
import { addCar } from './system-store/actions/cars';
import { addServiceRecord } from './system-store/actions/services';
import { addUserPart } from './system-store/actions/parts';
import {
    resolveInboxItem,
    approveInboxItem,
    approveCarModel,
    updateCatalogPart,
} from './system-store/actions/catalog';

export * from './system-store/types';
export { normalizeSlug } from './system-store/utils';

export const systemStore = {
    getState: () => storage.getState(),
    saveState: (state: SystemState) => storage.saveState(state),
    createUser,
    addCar,
    addServiceRecord,
    addUserPart,
    resolveInboxItem,
    approveInboxItem,
    approveCarModel,
    updateCatalogPart,
};