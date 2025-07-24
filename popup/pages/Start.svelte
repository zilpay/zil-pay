<script lang="ts">
    function handleGetStarted() {
    }
</script>

<div class="start-page">
    <div class="header">
        <div class="theme-toggle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C15.866 12 19 9.866 19 7C19 4.134 15.866 2 12 2C8.134 2 5 4.134 5 7C5 9.866 8.134 12 12 12Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 12C8.134 12 5 9.866 5 7C5 4.134 8.134 2 12 2C15.866 2 19 4.134 19 7C19 9.866 15.866 12 12 12Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="language-selector">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 11a3 3 0 10-6 0 3 3 0 006 0Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </div>
    <div class="content">
        <img src="/images/dragons.svg" alt="Dragons" class="dragon-image" />
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
