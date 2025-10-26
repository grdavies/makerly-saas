import { defineConfig } from 'vue-email';

export default defineConfig({
  verbose: true,
  silent: false,
  outDir: './dist',
  typescript: true,
  dir: './templates',
});
