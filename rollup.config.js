import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import { sass } from 'svelte-preprocess-sass';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

const popup = {
	input: 'popup/main.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'popup',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
				style: sass()
			}),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
const background = {
	input: 'core/background/index.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'background',
		file: 'public/build/background.js'
	},
	plugins: [
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		})
	]
};
const content = {
	input: 'core/content/index.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'content',
		file: 'public/build/content.js'
	},
	plugins: [
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		})
	]
};
const inpage = {
	input: 'core/inpage/index.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'inpage',
		file: 'public/build/inpage.js'
	},
	plugins: [
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		})
	]
};

export default [
	popup,
	background,
	content,
	inpage
];

