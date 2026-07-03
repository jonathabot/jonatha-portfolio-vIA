import type { z } from 'zod';
import type { portfolioSchema } from './schema';

export type PortfolioContent = z.infer<typeof portfolioSchema>;
export type Lang = 'pt' | 'en';
export type Loc<T = string> = { pt: T; en: T };
