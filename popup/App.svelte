<script lang="ts">
    import { get } from 'svelte/store';
    import { setupI18n } from 'popup/i18n';
    import globlSettingsStore from 'popup/store/global';
    import { Locales } from 'config/locale';
    import Router from './Router.svelte';

    let loading = $state(true);

    $effect(() => {
        const initialize = async () => {
            const { locale } = get(globlSettingsStore);
            try {
                if (locale === Locales.Auto) {
                    await setupI18n();
                } else {
                    await setupI18n({
                        withLocale: locale,
                    });
                }
            } catch (err) {
                console.error(err);
                await setupI18n({
                    withLocale: Locales.EN,
                });
            } finally {
                loading = false;
            }
        };

        initialize();
    });
</script>

{#if !loading}
    <Router />
{/if}
