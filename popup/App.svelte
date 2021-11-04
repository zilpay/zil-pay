<script lang="ts">
	import Router from 'svelte-spa-router';
	import { onMount } from 'svelte';
  import routes from './routers';
	import { setupI18n, isLocaleLoaded } from 'popup/i18n';
	import { getState } from "popup/backend";

	let loaded = false;

	onMount(async () => {
		if (!$isLocaleLoaded) {
			await setupI18n({ withLocale: 'en' });
		}

		const state = await getState();
		const guard = state.guard;

		loaded = true;
	});
</script>

{#if loaded}
	<Router  {routes} />
{/if}

<style lang="scss">
	@import "./styles/general";
</style>
