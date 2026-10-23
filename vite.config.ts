import { defineConfig } from 'vite';
export default defineConfig({
  build: { rolldownOptions: { input: { game: 'index.html', character: 'character.html' } } },
});
