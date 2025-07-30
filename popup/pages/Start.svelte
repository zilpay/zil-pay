<script lang="ts">
    import { _ }	 from 'popup/i18n';

    import globalStore from "popup/store/global";

    import SvgLoad from '../components/SvgLoad.svelte';
    import LanguageIcon from '../components/icons/Language.svelte';
    import AppearanceIcon from '../components/icons/Appearance.svelte';
    import Button from '../components/Button.svelte';

    import { Themes } from 'config/theme';
    import { themeDetect } from 'popup/mixins/theme';
    import { setGlobalState } from 'popup/background/wallet';


    function handleGetStarted() {
    }

    async function handleThemeToggle() {
        if ($globalStore.appearances == Themes.System) {
            const theme = themeDetect();

            if (theme == Themes.Light) {
                globalStore.set({
                    ...$globalStore,
                    appearances: Themes.Dark,
                });
            } else if (theme == Themes.Dark) {
                globalStore.set({
                    ...$globalStore,
                    appearances: Themes.Light,
                });
            }
        } else if ($globalStore.appearances == Themes.Light) {
            globalStore.set({
                ...$globalStore,
                appearances: Themes.Dark,
            });
        } else if ($globalStore.appearances == Themes.Dark) {
            globalStore.set({
                ...$globalStore,
                appearances: Themes.Light,
            });
        }

        document.body.setAttribute("theme", $globalStore.appearances);

        await setGlobalState();
    }

    function handleLanguageSelect() {
    }
</script>

<div class="start-page">
    <div class="header">
        <button class="theme-toggle" on:click={handleThemeToggle}>
            <AppearanceIcon width={28} height={28} />
        </button>
        <button class="language-selector" on:click={handleLanguageSelect}>
            <LanguageIcon width={36} height={36} />
        </button>
    </div>
    <div class="content">
        <SvgLoad
            src="/icons/little_dragons.svg"
            class="dragon-image"
            width="90%"
            height="90%"
            viewBox="0 0 460 460"
        />
    </div>
    <Button on:click={handleGetStarted}>
        {$_('start.btn')}
    </Button>
</div>

<style lang="scss">
    .start-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100vh;
        max-width: 400px;
        margin: 0 auto;
        background-color: var(--background-color);
        color: var(--text-primary);
        padding: 0 20px;
        box-sizing: border-box;
        padding-bottom: 16px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 20px 0;
    }

    .theme-toggle {
        padding: 4px;
    }

    .theme-toggle,
    .language-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid var(--modal-border);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    .theme-toggle:hover,
    .language-selector:hover {
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }

    .theme-toggle:active,
    .language-selector:active {
        transform: translateY(0);
    }

    .content {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
</style>
