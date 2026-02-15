import { useEffect, useState } from "react";

const SCRIPT_ID = "google-translate-script";
const SCRIPT_URL = "https://translate.google.com/translate_a/element.js";
const ELEMENT_ID = "google_translate_element";

/** Only these three languages; value is target lang code (empty = English/original). */
const LANGUAGES = [
  { value: "", label: "English", lang: "en" },
  { value: "te", label: "తెలుగు", lang: "te" },
  { value: "hi", label: "हिन्दी", lang: "hi" },
] as const;

const COOKIE_NAME = "googtrans";

function getCurrentLang(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const val = match ? decodeURIComponent(match[1].trim()) : "";
  // Cookie is /en/te or /en/hi; we want "te" or "hi" or "" for English
  if (val === "/en/te") return "te";
  if (val === "/en/hi") return "hi";
  return "";
}

/**
 * Re-apply Google Translate to the page after dynamic content (e.g. article body) has been rendered.
 * Call from ArticlePage when article content is ready so the body gets translated.
 */
export function triggerTranslateForDynamicContent(): void {
  const lang = getCurrentLang();
  if (!lang) return;
  const tryTrigger = (attempt = 0) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) {
      if (attempt < 5) setTimeout(() => tryTrigger(attempt + 1), 200 * (attempt + 1));
      return;
    }
    select.value = lang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  setTimeout(() => tryTrigger(0), 150);
}

function setLanguage(code: "" | "te" | "hi") {
  if (code === "") {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  } else {
    document.cookie = `${COOKIE_NAME}=/en/${code}; path=/`;
  }
  window.location.reload();
}

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; layout: number },
          elementId: string
        ) => void;
        TranslateElement: { InlineLayout: { SIMPLE: number } };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

/**
 * Compact language switcher: English, Telugu, Hindi only.
 * Uses Google Translate in a hidden div; our UI sets cookie and reloads.
 */
export function GoogleTranslate() {
  const [current, setCurrent] = useState("");

  useEffect(() => {
    setCurrent(getCurrentLang());
  }, []);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      const el = document.getElementById(ELEMENT_ID);
      if (el && window.google?.translate) {
        try {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
            ELEMENT_ID
          );
        } catch (_) {}
      }
    };

    if (document.getElementById(SCRIPT_ID)) {
      return () => {
        delete window.googleTranslateElementInit;
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${SCRIPT_URL}?cb=googleTranslateElementInit`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <>
      {/* Hidden container for Google widget (reads cookie and applies translation on load) */}
      <div
        id={ELEMENT_ID}
        className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
        aria-hidden
      />
      {/* Compact 3-language dropdown — matches header style */}
      <label className="relative inline-flex items-center">
        <span className="sr-only">Language</span>
        <select
          value={current}
          onChange={(e) => {
            const v = e.target.value as "" | "te" | "hi";
            setLanguage(v);
          }}
          className="h-8 pl-2.5 pr-8 text-sm bg-background text-foreground border border-input rounded-md cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:bg-muted/50 transition-colors min-w-[88px]"
          aria-label="Select language"
          title="Language: English, Telugu, Hindi"
        >
          {LANGUAGES.map(({ value, label }) => (
            <option key={value || "en"} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </label>
      {/* Hide Google's banner after translation */}
      <style>{`
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body.top { top: 0 !important; }
      `}</style>
    </>
  );
}
