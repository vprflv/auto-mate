
import { ruleBasedCatalogProvider } from './ruleBased';
import {CatalogProvider} from "@/types/catalog/catalog";

// Сейчас: rule-based (0 ₽)
// Потом: aiProvider / paidEpcProvider
export const catalogProvider: CatalogProvider = ruleBasedCatalogProvider;