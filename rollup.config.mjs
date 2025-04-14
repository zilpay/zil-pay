import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { sveltePreprocess } from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';

// Read package.json
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const production = !process.env.ROLLUP_WATCH;
const manifest = process.env.MANIFEST || 2;

// Shared base configuration
const createConfig = (name, input, output, extraPlugins = []) => ({
  input,
  output: {
    sourcemap: !production,
    format: 'iife',
    name,
    file: output
  },
  plugins: [
    ...extraPlugins,
    
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    
    commonjs(),
    
    typescript({
      sourceMap: !production,
      inlineSources: !production,
      outputToFilesystem: true,
      compilerOptions: {
        noEmit: false
      }
    }),
    
    json(),
    
    // Minify in production
    production && terser({
      format: {
        comments: false
      },
      compress: true
    }),
    
    // Generate bundle visualizations in production
    production && visualizer({
      filename: `stats/${name}.html`
    })
  ],
  watch: {
    clearScreen: false
  }
});

// Popup configuration with Svelte and SCSS/SASS support
const popup = createConfig(
  'popup',
  'popup/main.ts',
  'dist/bundle.js',
  [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
        scss: {
          // SCSS/SASS options
          renderSync: true,
          includePaths: ['popup/styles/'],
          prependData: '@import "popup/styles/global.scss";'
        }
      }),
      compilerOptions: {
        dev: !production
      }
    }),
    
    // Extract component CSS
    css({ output: 'bundle.css' })
  ]
);

const background = createConfig(
  'background',
  'background/index.ts',
  'dist/background.js',
  [
    // Replace any Node.js specific imports/code
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      'global': 'window',
      'process.browser': true
    }),
    
    // Copy static assets
    copy({
      targets: [
        { src: 'public/icons', dest: 'dist/' },
        { src: 'public/fonts', dest: 'dist/' },
        { src: 'public/lang', dest: 'dist/' },
        { src: 'public/imgs', dest: 'dist/' },
        { src: 'public/index.html', dest: 'dist/' },
        { src: 'public/phishing.html', dest: 'dist/' },
        {
  				src: `public/manifest_${manifest}.json`,
          dest: 'dist/',
					rename: 'manifest.json',
          transform: (contents) => {
            const jsonContent = JSON.parse(contents);
            
            // Update manifest with package.json values
            jsonContent.version = pkg.version;
            jsonContent.short_name = pkg.shortName || pkg.name;
            jsonContent.description = pkg.description;
            jsonContent.author = pkg.homepage;
            
            return JSON.stringify(jsonContent, null, 2);
          }
        }
      ]
    })
  ]
);

// Content script
const content = createConfig(
  'content',
  'content/index.ts',
  'dist/content.js',
  [
    replace({
      preventAssignment: true,
    })
  ]
);

export default [
  popup,
  background,
  content
];
