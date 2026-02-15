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
  
  // If no language selected (English), no need to trigger
  if (!lang) return;
  
  const tryTrigger = (attempt = 0) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    
    if (!select) {
      // Retry up to 10 times with exponential backoff
      if (attempt < 10) {
        setTimeout(() => tryTrigger(attempt + 1), 300 * (attempt + 1));
      } else {
        console.warn("Google Translate widget not found after 10 attempts");
      }
      return;
    }
    
    // Check if Google Translate is actually ready
    if (!window.google?.translate) {
      if (attempt < 10) {
        setTimeout(() => tryTrigger(attempt + 1), 300 * (attempt + 1));
      }
      return;
    }
    
    // Set to target language
    select.value = lang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    
    // Force a second trigger to ensure it applies
    setTimeout(() => {
      const selectAgain = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (selectAgain && selectAgain.value !== lang) {
        selectAgain.value = lang;
        selectAgain.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, 500);
  };
  
  // Wait for Google Translate script to be ready
  setTimeout(() => tryTrigger(0), 500);
}

function setLanguage(code: "" | "te" | "hi") {
  if (code === "") {
    // Clear all Google Translate cookies to return to English
    const hostname = window.location.hostname;
    const domain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    
    // Clear cookies with different variations
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; domain=${hostname}`;
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; domain=.${domain}`;
    
    // Set to English explicitly before reload
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } else {
    document.cookie = `${COOKIE_NAME}=/en/${code}; path=/`;
  }
  
  // Force hard reload to ensure translation clears
  setTimeout(() => {
    window.location.reload();
  }, 100);
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
            { 
              pageLanguage: "en", 
              includedLanguages: "en,te,hi",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
            },
            ELEMENT_ID
          );
          
          // After initialization, apply translation if language is selected
          setTimeout(() => {
            const lang = getCurrentLang();
            if (lang) {
              triggerTranslateForDynamicContent();
            }
          }, 1000);
        } catch (e) {
          console.error("Google Translate initialization error:", e);
        }
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
    script.async = false; // Load synchronously to ensure it's ready
    document.head.appendChild(script); // Add to head for priority
    
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
      {/* Hide Google's banner after translation and fix layout issues */}
      <style>{`
        .goog-te-banner-frame.skiptranslate { 
          display: none !important; 
        }
        body { 
          top: 0 !important; 
          position: static !important;
        }
        /* Ensure translated text is visible */
        font[style*="vertical-align: inherit;"] {
          vertical-align: baseline !important;
        }
        /* Fix for translated content */
        .translated-ltr {
          direction: ltr !important;
        }
      `}</style>
    </>
  );
}
