import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import babel from 'vite-plugin-babel';

const wrapMonitor = require('./babel-plugins/wrap-monitor.js');

export default defineConfig({
  plugins: [
    react(),
    babel({
      filter: (id) =>
        (id.endsWith('.tsx') || id.endsWith('.jsx')) &&
        /[/\\]components[/\\]/.test(id), // ✅ Only wrap files in 'components/' folder
      babelConfig: {
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [wrapMonitor],
      },
    }),
  ],
});
