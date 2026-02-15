import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { preloadChunksPlugin } from "./vite-preload-chunks";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && process.env.VITE_LOVABLE_TAGGER === "true" && componentTagger(),
    mode === "production" && preloadChunksPlugin("/"),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router')) return 'react-vendor';
          if (id.includes('firebase')) return 'firebase-vendor';
          if (id.includes('node_modules/@tiptap')) return 'tiptap-vendor';
          if (id.includes('node_modules/recharts')) return 'recharts-vendor';
          if (id.includes('node_modules/lucide-react')) return 'lucide-vendor';
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}));
