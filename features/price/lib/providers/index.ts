
import { webSearchPriceProvider } from './webSearch';
import {PriceProvider} from "@/types/prices/price";

// Сейчас: веб-ссылки
// Потом: supplier API / AI
export const priceProvider: PriceProvider = webSearchPriceProvider;