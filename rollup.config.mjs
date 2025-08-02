import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { sveltePreprocess } from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import { visualizer } from 'rollup-plugin-visualizer';
import cssnano from 'cssnano';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const production = !process.env.ROLLUP_WATCH;
const manifest = process.env.MANIFEST || 3;

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
        target: 'ES2020',
        module: 'esnext',
        moduleResolution: 'node',
        lib: ['ES2020', 'DOM'],
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
        noFallthroughCasesInSwitch: false,
        noEmit: false,
        declaration: false,
        declarationMap: false,
        resolveJsonModule: true,
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules/**', '__tests__/**']
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.json', '.svelte'],
      preferBuiltins: false
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
    }),
  ].filter(Boolean),
  watch: {
    clearScreen: false
  },
  external: [],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'TS7029' && warning.loc?.file?.includes('proto/zq1.ts')) return;
    warn(warning);
  }
});

const popup = createConfig(
  'popup',
  'popup/main.ts',
  'dist/bundle.js',
  [
    svelte({
      compilerOptions: { runes: true },
      extensions: ['.svelte'],
      preprocess: sveltePreprocess({
        sourceMap: !production,
        typescript: {
          tsconfigFile: './tsconfig.json'
        },
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
      delimiters: ['', ''],
      values: {
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        'global.': 'globalThis.',
        'process.browser': 'true'
      }
    }),
    copy({
      targets: [
        { src: 'public/icons', dest: 'dist/' },
        { src: 'public/fonts', dest: 'dist/' },
        { src: 'public/lang', dest: 'dist/' },
        { src: 'public/bip39', dest: 'dist/' },
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
      delimiters: ['', ''],
      values: {}
    })
  ]
);

export default [
  popup,
  background,
  content
];

