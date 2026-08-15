// features/catalog/lib/providers/index.ts

import { mockCatalogProvider } from './mock';
import {CatalogProvider} from "@/types/catalog/catalog";

// Позже здесь будет переключение на реальный провайдер
export const catalogProvider: CatalogProvider = mockCatalogProvider;