<script lang="ts">
    import { _ } from 'popup/i18n';
    import { push } from 'popup/router/navigation';
    import globalStore from "popup/store/global";
    import { setGlobalState } from 'popup/background/wallet';
    import { themeDetect } from 'popup/mixins/theme';
    import { Themes } from 'config/theme';

    import SvgLoad from '../components/SvgLoad.svelte';
    import LanguageIcon from '../components/icons/Planet.svelte';
    import UpRightIcon from '../components/icons/UpRight.svelte';
    import Button from '../components/Button.svelte';
    import Switch from '../components/Switch.svelte';
    import SunIcon from '../components/icons/Sun.svelte';
    import MoonIcon from '../components/icons/Moon.svelte';

    let isDarkMode = $state(false);

    $effect(() => {
        const theme = $globalStore.appearances;
        if (theme === Themes.System) {
            isDarkMode = themeDetect() === Themes.Dark;
        } else {
            isDarkMode = theme === Themes.Dark;
        }
    });
    
    $effect(() => {
        const newTheme = isDarkMode ? Themes.Dark : Themes.Light;
        globalStore.update(store => ({ ...store, appearances: newTheme }));
        document.body.setAttribute("theme", newTheme);
        setGlobalState();
    });

    function handleGetStarted() {
        return push('/new-wallet-options');
    }

    function handleLanguageSelect() {
        return push('/locale');
    }
</script>

<div class="start-page">
    <div class="header">
        <Switch bind:checked={isDarkMode}>
            {#if isDarkMode}
                <MoonIcon />
            {:else}
                <SunIcon />
            {/if}
        </Switch>
        <button class="language-button" onclick={handleLanguageSelect}>
            <LanguageIcon />
            <span>{$globalStore.locale.toUpperCase()}</span>
            <UpRightIcon />
        </button>
    </div>

    <div class="content">
        <SvgLoad
            src="/icons/bear.svg"
            viewBox="60 285 660 660"
            class="dragons"
        />
        <div class="title-group">
            <h1 class="title">
                {$_('start.name')}
            </h1>
            <p class="subtitle">
                {$_('start.title')}
            </p>
        </div>
    </div>

    <div class="footer">
        <Button onclick={handleGetStarted} height={48}>
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
        padding: 12px 0;
        flex-shrink: 0;
    }

    .language-button {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        background-color: transparent;
        transition: all 0.2s ease;
        gap: 4px;
        padding: 2px 0;
        border-radius: 6px;
        font-size: var(--font-size-large);
        font-weight: 400;
        color: var(--color-content-text-inverted);

        :global(svg) {
            width: 20px;
            height: 20px;
        }

        :global(svg:last-child) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-secondary);
        }
    }

    .content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        gap: 8px;
    }

    :global(.dragons) {
        width: 200px;
        height: 200px;
    }
    
    .title-group {
        text-align: center;
    }

    .title {
        font-size: 24px;
        font-weight: 700;
        line-height: 36px;
        margin: 0;
    }

    .subtitle {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        line-height: 16px;
        margin: 0;
    }

    .footer {
        width: 100%;
        padding: 16px 0 24px 0;
        flex-shrink: 0;
    }

    @media (min-width: 480px) {
        .content {
            gap: 24px;
        }
    }
</style>
