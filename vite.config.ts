import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Simplified chunking - let Vite handle Firebase as one chunk to avoid circular deps
          if (id.includes('node_modules')) {
            // Keep Firebase together - splitting causes circular dependencies
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase';
            }
            // Separate React ecosystem
            if (id.includes('react-router-dom')) return 'react-router';
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('/react/')) return 'react';
            // UI libraries
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('lucide-react')) return 'lucide';
            // Heavy libraries
            if (id.includes('@tiptap')) return 'tiptap';
            if (id.includes('recharts')) return 'recharts';
            // Everything else
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}));
