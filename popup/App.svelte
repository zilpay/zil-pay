<script lang="ts">
	import Router from 'svelte-spa-router';
	import { onMount } from 'svelte';
  import routes from './routers';
	import { setupI18n } from 'popup/i18n';
	import { Locales } from 'config/locale';

	import localeStore from 'popup/store/locale';


	let loaded = false;

	onMount(async () => {
		try {
			if ($localeStore === Locales.Auto) {
				await setupI18n();
			} else {
				await setupI18n({
					withLocale: $localeStore
				});
			}
		} catch {
			await setupI18n({
				withLocale: Locales.EN
			});
		}

		loaded = true;
	});
</script>

{#if loaded}
	<Router  {routes} />
{/if}

<style lang="scss">
	@import "./styles/general";
</style>
