<script lang="ts">
	import Router from 'svelte-spa-router';
  import routes from 'popup/routes';

	import { Wallet } from './backend';
	new Wallet().getState().then(console.log);

	export let name: string;
</script>

<Router {routes} />
