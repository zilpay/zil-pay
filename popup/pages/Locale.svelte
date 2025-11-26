<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';
    import { setupI18n } from 'popup/i18n';
    import { Locales } from 'config/locale';
    
    import NavBar from '../components/NavBar.svelte';
    import SelectableListItem from '../components/SelectableListItem.svelte';

    type Language = {
        code: Locales;
        primaryName: string;
        secondaryName: string;
    };

    const languages: Language[] = [
        { code: Locales.Auto, primaryName: $_('locale.system'), secondaryName: $_('locale.systemDesc') },
        { code: Locales.RU, primaryName: 'Russian', secondaryName: 'Русский' },
        { code: Locales.EN, primaryName: 'English', secondaryName: 'English' },
        { code: Locales.JA, primaryName: 'Japanese', secondaryName: '日本語' },
        { code: Locales.ZH, primaryName: 'Chinese', secondaryName: '中文' },
        { code: Locales.KO, primaryName: 'Korean', secondaryName: '한국어' }
    ];

    async function handleLanguageSelect(localeCode: Locales) {
        if ($globalStore.locale === localeCode) return;
        
        globalStore.update(store => ({ ...store, locale: localeCode }));

        if (localeCode === Locales.Auto) {
            await setupI18n();
        } else {
            await setupI18n({ withLocale: localeCode });
        }
        
        await setGlobalState();
    }
</script>

<div class="page-container">
    <NavBar title={$_('locale.title')} />
    <div class="language-list">
        {#each languages as lang (lang.code)}
            <SelectableListItem
                label={lang.primaryName}
                sublabel={lang.secondaryName}
                selected={$globalStore.locale === lang.code}
                onselect={() => handleLanguageSelect(lang.code)}
            />
        {/each}
    </div>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0;
        box-sizing: border-box;
    }

    .language-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px var(--padding-side);
        display: flex;
        flex-direction: column;
    }
</style>
