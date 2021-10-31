<script lang="ts">
	import Router from 'svelte-spa-router';
  import routes from './routers';
	import { setupI18n, isLocaleLoaded } from 'popup/i18n';

	$: if (!$isLocaleLoaded) {
		setupI18n({ withLocale: 'en' });
	}
</script>

{#if $isLocaleLoaded}
	<Router  {routes} />
{/if}

<style type="text/scss">
	@import "./styles/general";
</style>
