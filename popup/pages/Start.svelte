<script lang="ts">
    function handleGetStarted() {
    }
</script>

<div class="start-page">
    <div class="header">
        <div class="theme-toggle">
            <img src="/icons/appearance.svg" alt="">
        </div>
        <div class="language-selector">
            <img src="/icons/language.svg" alt="">
        </div>
    </div>
    <div class="content">
        <img src="/icons/little_dragons.svg" alt="Dragons" class="dragon-image" />
    </div>
    <button class="get-started-button" on:click={handleGetStarted}>
        Get Started
    </button>
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

    .dragon-image {
        max-width: 80%;
        height: auto;
    }

    .get-started-button {
        background-color: #8b00ff;
        color: #fff;
        font-size: 1.5rem;
        font-weight: bold;
        padding: 16px 0;
        width: 100%;
        border: none;
        border-radius: 0;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #7b00e0;
        }
    }
</style>
