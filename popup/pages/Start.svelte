<script lang="ts">
    import { _ } from 'popup/i18n';
    import { push } from 'popup/router/navigation';

    import globalStore from "popup/store/global";

    import SvgLoad from '../components/SvgLoad.svelte';
    import LanguageIcon from '../components/icons/Planet.svelte';
    import AppearanceIcon from '../components/icons/Appearance.svelte';
    import UpRightIcon from '../components/icons/UpRight.svelte';
    import Button from '../components/Button.svelte';

    import { Themes } from 'config/theme';
    import { themeDetect } from 'popup/mixins/theme';
    import { setGlobalState } from 'popup/background/wallet';

    function handleGetStarted() {
        return push('/new-wallet-options');
    }

    async function handleThemeToggle() {
        let newTheme: Themes;
        const currentAppearance = $globalStore.appearances;
        
        if (currentAppearance === Themes.System) {
            newTheme = themeDetect() === Themes.Light ? Themes.Dark : Themes.Light;
        } else {
            newTheme = currentAppearance === Themes.Light ? Themes.Dark : Themes.Light;
        }

        globalStore.update(store => ({ ...store, appearances: newTheme }));
        document.body.setAttribute("theme", newTheme);
        await setGlobalState();
    }

    function handleLanguageSelect() {
        return push('/locale');
    }
</script>

<div class="start-page">
    <div class="header">
        <button class="theme-toggle" on:click={handleThemeToggle}>
            <AppearanceIcon width={20} height={20} />
        </button>
        <button class="language-button" on:click={handleLanguageSelect}>
            <LanguageIcon width={16} height={16} />
            <span>{$globalStore.locale}</span>
            <UpRightIcon width={16} height={16} />
        </button>
    </div>

    <div class="content">
        <SvgLoad
            src="/icons/little_dragons.svg"
            class="dragon-image"
            width="250"
            height="250"
            viewBox="0 0 460 460"
        />
        <h1 class="title">
            {$_('start.name')}
        </h1>
        <p class="subtitle">
            {$_('start.title')}
        </p>
    </div>

    <div class="footer">
        <Button onclick={handleGetStarted}>
            {$_('start.btn')}
        </Button>
    </div>
</div>

<style lang="scss">
    .start-page {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: var(--max-content-width);
        margin: 0 auto;
        background-color: var(--color-neutral-background-base);
        color: var(--color-content-text-inverted);
        padding: 0 var(--padding-side);
        box-sizing: border-box;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 20px 0;
        flex-shrink: 0;
    }

    .theme-toggle,
    .language-button {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid var(--color-inputs-border-default);
        background-color: var(--color-neutral-background-base);
        transition: all 0.2s ease;

        &:hover {
            border-color: var(--color-inputs-border-focus);
        }
    }

    .theme-toggle {
        width: 48px;
        height: 32px;
        border-radius: 16px;
    }

    .language-button {
        gap: 8px;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: var(--font-size-medium);
        font-weight: 500;
        color: var(--color-content-text-secondary);

        :global(svg) {
            opacity: 0.7;
        }
    }

    .content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        gap: 16px;
    }
    
    .title {
        font-size: calc(var(--font-size-xl) * 1.8);
        font-weight: 700;
        margin: 0;
    }

    .subtitle {
        font-size: var(--font-size-large);
        color: var(--color-content-text-secondary);
        margin: -10px 0 0 0;
    }

    .footer {
        width: 100%;
        padding: 20px 0;
        flex-shrink: 0;
    }
</style>
