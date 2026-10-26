import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";

const initialLng =
  typeof window !== "undefined" && window.location.pathname.startsWith("/en")
    ? "en"
    : "es";

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initialLng,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://swibook.sibylab.com";

export type AppLocale = "es" | "en";

export function localeFromPath(pathname: string): AppLocale {
  return pathname.startsWith("/en") ? "en" : "es";
}

export function pathForLocale(locale: AppLocale, hash = ""): string {
  const base = locale === "en" ? "/en" : "/";
  const h = hash.startsWith("#") ? hash : hash ? `#${hash}` : "";
  return `${base}${h}`;
}
