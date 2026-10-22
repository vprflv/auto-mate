import { StoredCatalogNode, StoredMasterModel, SystemState } from './types';

export const STORAGE_KEY = 'bm_shared_system_state_v1';

// Чистая база моделей — наполняется только после реального добавления авто модератором
export const initialDefaultMasterModels: StoredMasterModel[] = [];

// Чистая база узлов запчастей — наполняется только из одобренных тикетов
export const initialDefaultNodes: StoredCatalogNode[] = [];

export const initialDefaultState: SystemState = {
    users: [],
    cars: [],
    serviceRecords: [],
    inbox: [],
    catalogNodes: initialDefaultNodes,
    masterModels: initialDefaultMasterModels,
};