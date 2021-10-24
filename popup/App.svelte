<script lang="ts">
	import Router from 'svelte-spa-router';
	import { onMount } from 'svelte';
  import routes from './routers';

	import { Wallet } from "popup/backend";

	let state = null;

	onMount(async () => {
		state = await new Wallet().getState();
	});
</script>

{#if state}
	<Router {routes} />
{/if}

<style type="text/scss">
	@import "./styles/general";
</style>
