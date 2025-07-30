<script lang="ts">
    import SvgLoad from '../components/SvgLoad.svelte';
    import LanguageIcon from '../components/icons/Language.svelte';
    import AppearanceIcon from '../components/icons/Appearance.svelte';
    import Button from '../components/Button.svelte';

    function handleGetStarted() {
    }
</script>

<div class="start-page">
    <div class="header">
        <div class="theme-toggle">
            <AppearanceIcon width={28} height={28} />
        </div>
        <div class="language-selector">
            <LanguageIcon width={36} height={36} />
        </div>
    </div>
    <div class="content">
        <SvgLoad src="/icons/little_dragons.svg" class="dragon-image" />
    </div>
    <Button on:click={handleGetStarted} class="secondary">
        Get Started
    </Button>
</div>

<style>
    .start-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100vh;
        background-color: #000;
        color: #fff;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 20px;
    }

    .theme-toggle,
    .language-selector {
        display: flex;
        align-items: center;
    }
</style>
