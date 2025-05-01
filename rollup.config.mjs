import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { sveltePreprocess } from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const production = !process.env.ROLLUP_WATCH;
const manifest = process.env.MANIFEST || 2;

const createConfig = (name, input, output, extraPlugins = []) => ({
  input,
  output: {
    sourcemap: !production,
    format: 'iife',
    name,
    file: output
  },
  plugins: [
    typescript({
      sourceMap: !production,
      inlineSources: !production,
      compilerOptions: {
        noEmit: false,
        declaration: false,
        declarationMap: false
      }
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
      extensions: ['.ts', '.mjs', '.js', '.json', '.svelte']
    }),
    commonjs(),
    json(),
    ...extraPlugins,
    production && terser({
      format: {
        comments: false
      },
      compress: true
    }),
    production && visualizer({
      filename: `stats/${name}.html`
    })
  ],
  watch: {
    clearScreen: false
  }
});

const popup = createConfig(
  'popup',
  'popup/main.ts',
  'dist/bundle.js',
  [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
        scss: {
          renderSync: true,
          includePaths: ['popup/styles/'],
          prependData: '@use "popup/styles/global.scss";'
        }
      }),
      compilerOptions: {
        dev: !production
      }
    }),
    postcss({
      extract: 'bundle.css',
      minimize: production,
      plugins: [
        cssnano({
          preset: 'default'
        })
      ],
      sourceMap: !production
    })
  ]
);

const background = createConfig(
  'background',
  'background/index.ts',
  'dist/background.js',
  [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      'global': 'window',
      'process.browser': true
    }),
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
