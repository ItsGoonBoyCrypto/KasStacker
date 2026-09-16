// i18n registry for the translated core funnel (home + the 6-stop tour).
// Pages outside the funnel stay English; the header dropdown appears
// everywhere and falls back to the locale home for uncovered paths.
import en from './en.json';

export const LOCALES = ['es', 'de', 'fr', 'pt', 'tr', 'nl', 'zh', 'id', 'ru', 'ja', 'ko'] as const;
export type Locale = (typeof LOCALES)[number] | 'en';

export type Dict = typeof en;

// Paths (relative to the locale prefix) that exist in every locale — the
// dropdown maps the current page to its translation only for these.
export const COVERED = [
  '/',
  '/learn/',
  '/learn/kaspa-in-60-seconds/',
  '/learn/what-toccata-changed/',
  '/learn/meet-the-stack/',
  '/learn/how-it-fits-together/',
  '/learn/try-it/',
  '/learn/faq/',
];

const modules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: Dict }>;
export async function loadDict(lang: string): Promise<Dict> {
  if (lang === 'en') return en;
  const mod = modules[`./${lang}.json`];
  if (!mod) throw new Error(`no dictionary for locale "${lang}"`);
  return mod.default;
}

// html lang attribute values where they differ from the code
export const HTML_LANG: Record<string, string> = { zh: 'zh-CN', pt: 'pt-BR', id: 'id-ID' };

export function localePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}
