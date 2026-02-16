import { useEffect, useState } from "react";

const SCRIPT_ID = "google-translate-script";
const SCRIPT_URL = "https://translate.google.com/translate_a/element.js";
const ELEMENT_ID = "google_translate_element";

/** Only these three languages; value is target lang code (empty = Telugu/original). */
const LANGUAGES = [
  { value: "", label: "తెలుగు", lang: "te" },      // Original language (Telugu)
  { value: "en", label: "English", lang: "en" },    // Translate to English
  { value: "hi", label: "हिन्दी", lang: "hi" },    // Translate to Hindi
] as const;

const COOKIE_NAME = "googtrans";

function getCurrentLang(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const val = match ? decodeURIComponent(match[1].trim()) : "";
  // Cookie format: /te/en (Telugu to English) or /te/hi (Telugu to Hindi)
  // Extract target language (after second slash)
  if (val === "/te/en") return "en";    // Telugu → English
  if (val === "/te/hi") return "hi";    // Telugu → Hindi
  return "";  // No translation (original Telugu)
}

// Export for use in other components
export function getCurrentLanguage(): string {
  return getCurrentLang();
}

// Function to trigger translation to a specific language
export function translateTo(targetLang: "en" | "hi" | "") {
  if (targetLang === "") {
    // Clear translation
    const hostname = window.location.hostname;
    const domain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    const rootDomain = domain.split('.').slice(-2).join('.');
    
    const cookieNames = ['googtrans', COOKIE_NAME];
    const domains = ['', hostname, `.${hostname}`, domain, `.${domain}`, rootDomain, `.${rootDomain}`];
    
    cookieNames.forEach(name => {
      domains.forEach(dom => {
        const domainStr = dom ? `; domain=${dom}` : '';
        document.cookie = `${name}=; path=/; max-age=0${domainStr}`;
      });
    });
    
    window.location.replace(window.location.pathname + window.location.search);
  } else {
    // Set translation
    document.cookie = `${COOKIE_NAME}=/te/${targetLang}; path=/`;
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}

/**
 * Force complete page re-translation for dynamically loaded content.
 * This is the nuclear option that works reliably for article pages.
 */
export function triggerTranslateForDynamicContent(): void {
  const lang = getCurrentLang();
  
  // If no language selected (English), no need to trigger
  if (!lang) return;
  
  // Strategy: Tell Google Translate to restore original, then translate again
  // This ensures the full page gets translated, not just cached elements
  const forceRetranslate = (attempt = 0) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    
    if (!select) {
      if (attempt < 15) {
        setTimeout(() => forceRetranslate(attempt + 1), 200 * (attempt + 1));
      }
      return;
    }
    
    if (!window.google?.translate) {
      if (attempt < 15) {
        setTimeout(() => forceRetranslate(attempt + 1), 200 * (attempt + 1));
      }
      return;
    }
    
    // Step 1: Reset to English (original)
    select.value = "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    
    // Step 2: Wait a moment, then translate to target language
    setTimeout(() => {
      const sel = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (sel) {
        sel.value = lang;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        
        // Step 3: Triple-trigger for maximum reliability
        setTimeout(() => {
          const finalSel = document.querySelector<HTMLSelectElement>(".goog-te-combo");
          if (finalSel) {
            finalSel.value = lang;
            finalSel.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }, 800);
      }
    }, 400);
  };
  
  // Wait for content to be in DOM, then trigger
  setTimeout(() => forceRetranslate(0), 1000);
}

function setLanguage(code: "" | "en" | "hi") {
  if (code === "") {
    // Return to original Telugu - clear all translation
    const hostname = window.location.hostname;
    const domain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    const rootDomain = domain.split('.').slice(-2).join('.');
    
    // Clear ALL possible cookie variations
    const cookieNames = ['googtrans', COOKIE_NAME];
    const domains = ['', hostname, `.${hostname}`, domain, `.${domain}`, rootDomain, `.${rootDomain}`];
    
    cookieNames.forEach(name => {
      domains.forEach(dom => {
        const domainStr = dom ? `; domain=${dom}` : '';
        document.cookie = `${name}=; path=/; max-age=0${domainStr}`;
      });
    });
    
    // Hard reload to original Telugu
    window.location.replace(window.location.pathname + window.location.search);
  } else {
    // Translate FROM Telugu TO target language
    document.cookie = `${COOKIE_NAME}=/te/${code}; path=/`;  // Changed from /en/ to /te/
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
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
              pageLanguage: "te",  // Changed from "en" to "te" - Telugu is the source language
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
      {/* Completely hidden container for Google widget */}
      <div
        id={ELEMENT_ID}
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          visibility: 'hidden',
        }}
        aria-hidden="true"
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
      {/* Hide ALL Google Translate UI elements completely */}
      <style>{`
        /* Hide all Google Translate banners and popups */
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-te-balloon,
        .goog-te-ftab,
        .goog-te-menu-frame,
        .goog-te-menu2,
        .goog-te-menu-value,
        #goog-gt-,
        .goog-tooltip,
        .goog-text-highlight,
        div[id^="goog-gt-"],
        div[class^="goog-te"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Hide all iframes from Google Translate */
        iframe[id*="goog"],
        iframe[src*="translate.google"],
        iframe[src*="translate_a/element"] {
          display: none !important;
          visibility: hidden !important;
          position: absolute !important;
          left: -9999px !important;
        }
        
        /* Fix body positioning issues */
        body {
          top: 0 !important;
          position: static !important;
        }
        
        body.translated-ltr {
          top: 0 !important;
        }
        
        /* Hide the original Google Translate widget completely */
        #google_translate_element,
        #google_translate_element * {
          display: none !important;
        }
        
        .goog-te-gadget,
        .goog-te-gadget * {
          display: none !important;
        }
        
        /* Hide combo text but keep select functional */
        .goog-te-combo {
          visibility: hidden !important;
          position: absolute !important;
          pointer-events: none !important;
          left: -9999px !important;
        }
        
        /* Hide spinner and loading elements */
        .goog-te-spinner-pos,
        .goog-te-spinner-animation {
          display: none !important;
        }
        
        /* Fix vertical alignment of translated text */
        font[style*="vertical-align: inherit;"] {
          vertical-align: baseline !important;
        }
        
        /* Fix translated content direction */
        .translated-ltr {
          direction: ltr !important;
        }
        
        /* Ensure notranslate class works */
        .notranslate {
          transform: none !important;
        }
        
        /* Hide any overlays or tooltips */
        [class*="goog-"],
        [id*="goog-"] {
          z-index: -1 !important;
        }
      `}</style>
    </>
  );
}
