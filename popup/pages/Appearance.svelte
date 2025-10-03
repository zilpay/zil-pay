<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';
    import { Themes } from 'config/theme';
    import { themeDetect } from 'popup/mixins/theme';

    import NavBar from '../components/NavBar.svelte';
    import ActionCard from '../components/ActionCard.svelte';
    import Switch from '../components/Switch.svelte';

    type ThemeOption = {
        value: Themes;
        title: string;
        subtitle: string;
    };

    let compactNumbers = $state($globalStore.abbreviatedNumber);
    let selectedTheme = $state($globalStore.appearances);

    const themeOptions: ThemeOption[] = [
        {
            value: Themes.System,
            title: $_('appearance.deviceSettings'),
            subtitle: $_('appearance.deviceSettingsDesc')
        },
        {
            value: Themes.Dark,
            title: $_('appearance.darkMode'),
            subtitle: $_('appearance.darkModeDesc')
        },
        {
            value: Themes.Light,
            title: $_('appearance.lightMode'),
            subtitle: $_('appearance.lightModeDesc')
        }
    ];

    async function handleThemeChange(theme: Themes) {
        selectedTheme = theme;
        globalStore.update(store => ({ ...store, appearances: theme }));
        
        let bodyTheme = theme;
        if (theme === Themes.System) {
            bodyTheme = themeDetect();
        }
        document.body.setAttribute("theme", bodyTheme);
        
        await setGlobalState();
    }
    
    async function handleCompactToggle() {
        compactNumbers = !compactNumbers;
        globalStore.update(store => ({ ...store, abbreviatedNumber: compactNumbers }));
        await setGlobalState();
    }
</script>

<div class="page-container">
    <NavBar title={$_('appearance.title')} />
    <div class="content">
        <ActionCard
            title={$_('appearance.compactNumbers')}
            subtitle={$_('appearance.compactNumbersDesc')}
            onaction={handleCompactToggle}
        >
            {#snippet left()}
                <div class="abbreviation-icon">AB</div>
            {/snippet}
            {#snippet right()}
                <Switch
                    checked={compactNumbers}
                    variant="default"
                />
            {/snippet}
        </ActionCard>

        {#each themeOptions as option (option.value)}
            <ActionCard
                title={option.title}
                subtitle={option.subtitle}
                selected={selectedTheme === option.value}
                onaction={() => handleThemeChange(option.value)}
            >
                {#snippet left()}
                    <div class="radio-circle" class:checked={selectedTheme === option.value}>
                        {#if selectedTheme === option.value}
                            <div class="radio-inner-dot"></div>
                        {/if}
                    </div>
                {/snippet}
                {#snippet right()}{/snippet}
            </ActionCard>
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

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 24px var(--padding-side);
        overflow-y: auto;
    }

    .abbreviation-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Geist, sans-serif;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-content-icon-secondary);
        outline: 1px solid var(--color-content-icon-secondary);
        outline-offset: -1px;
    }

    .radio-circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--color-controls-selector-border);
        background: var(--color-controls-selector-base);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &.checked {
            background: var(--color-controls-selector-select);
            border-color: var(--color-controls-selector-select);
        }
    }

    .radio-inner-dot {
        width: 12px;
        height: 12px;
        background: var(--color-controls-selector-checker, white);
        border-radius: 50%;
    }
</style>
