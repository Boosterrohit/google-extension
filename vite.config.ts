import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' keeps asset paths relative so the build works inside chrome-extension://
export default defineConfig({ base: './', plugins: [react()], build: { outDir: 'dist', emptyOutDir: true } });
