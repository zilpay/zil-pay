<script lang="ts">
    import { _ } from 'popup/i18n';
    import { pop } from 'popup/router/navigation';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';
    import { setupI18n } from 'popup/i18n';
    import { Locales } from 'config/locale';
    
    import NavBar from '../components/NavBar.svelte';

    type Language = {
        code: Locales;
        primaryName: string;
        secondaryName: string;
    };

    const languages: Language[] = [
        { code: Locales.Auto, primaryName: 'System', secondaryName: 'Auto-detect' },
        { code: Locales.RU, primaryName: 'Russian', secondaryName: 'Русский' },
        { code: Locales.EN, primaryName: 'English', secondaryName: 'English' },
        { code: Locales.JA, primaryName: 'Japanese', secondaryName: '日本語' },
        { code: Locales.ZH, primaryName: 'Chinese', secondaryName: '中文' }
    ];

    async function handleLanguageSelect(localeCode: Locales) {
        if ($globalStore.locale === localeCode) return;
        
        globalStore.update(store => ({ ...store, locale: localeCode }));
        await setGlobalState();

        if (localeCode === Locales.Auto) {
            await setupI18n();
        } else {
            await setupI18n({ withLocale: localeCode });
        }
        
        globalStore.set({
            ...$globalStore,
            locale: localeCode,
        });

        await setGlobalState();
    }
</script>

<div class="locale-page">
    <NavBar title={$_('locale.title')} onClose={pop} />
    <div class="language-container">
        <div class="language-grid">
            {#each languages as lang}
                <button 
                    class="language-card" 
                    class:selected={$globalStore.locale === lang.code}
                    onclick={() => handleLanguageSelect(lang.code)}
                    aria-pressed={$globalStore.locale === lang.code}
                >
                    <div class="language-content">
                        <div class="primary-name">{lang.primaryName}</div>
                        <div class="secondary-name">{lang.secondaryName}</div>
                    </div>
                    <div class="selection-indicator"></div>
                </button>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .locale-page {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: var(--background-color);
        padding: 0 20px 20px;
        box-sizing: border-box;
    }

    .language-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }

    .language-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 0;
    }

    .language-card {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 20px 24px;
        background-color: var(--card-background);
        border: 2px solid transparent;
        border-radius: 16px;
        cursor: pointer;
        text-align: left;
        min-height: 72px;
        
        &:hover {
            border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
        }

        &:focus {
            outline: none;
            border-color: var(--primary-purple);
        }

        &.selected {
            background: linear-gradient(135deg, 
                color-mix(in srgb, var(--primary-purple) 15%, transparent),
                color-mix(in srgb, var(--primary-purple) 8%, transparent)
            );
            border-color: var(--primary-purple);

            .selection-indicator {
                opacity: 1;
            }

            .primary-name {
                color: var(--primary-purple);
            }
        }
    }

    .language-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .primary-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary);
    }

    .secondary-name {
        font-size: 14px;
        color: var(--text-secondary);
        opacity: 0.8;
    }

    .selection-indicator {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-purple), color-mix(in srgb, var(--primary-purple) 80%, #000));
        opacity: 0;
        position: relative;
        flex-shrink: 0;
        
        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 6px;
            height: 10px;
            border: 2px solid white;
            border-top: none;
            border-left: none;
            transform: translate(-50%, -60%) rotate(45deg);
        }
    }
</style>
