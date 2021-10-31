<script lang="ts">
	import Router from 'svelte-spa-router';
  import routes from './routers';
	import { setupI18n, isLocaleLoaded } from 'popup/i18n';
	import barsStore from 'app/store/bars';

	import TopBar from './components/TopBar.svelte';
	import BottomTabs from './components/BottomTabs.svelte';

	$: if (!$isLocaleLoaded) {
		setupI18n({ withLocale: 'en' });
	}
</script>

{#if $barsStore}
	<TopBar />
{/if}

{#if $isLocaleLoaded}
	<Router  {routes} />
{/if}

{#if $barsStore}
	<BottomTabs />
{/if}

<style type="text/scss">
	@import "./styles/general";
</style>
