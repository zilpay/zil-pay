import App from './App.svelte';
import { Wallet } from './backend';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});


new Wallet().getState().then(console.log);

export default app;
