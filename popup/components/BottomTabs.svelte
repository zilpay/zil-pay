<script lang="ts">
    import { currentRoute } from '../store/route';
    import { push } from '../router/navigation';
    import HomeIcon from './icons/Home.svelte';
    import CollectIcon from './icons/CollectIcon.svelte';
    import ReceiveIcon from './icons/Receive.svelte';
    import HistoryIcon from './icons/History.svelte';
    import SettingsIcon from './icons/Settings.svelte';

    const links = {
        home: '/',
        collect: '/collect',
        swap: '/swap',
        history: '/history',
        settings: '/settings'
    };

    function navigate(path: string) {
        if ($currentRoute?.path !== path) {
            push(path);
        }
    }
</script>

<nav class="bottom-nav-bar">
    <button
        class="nav-button"
        class:active={$currentRoute?.path === links.home}
        onclick={() => navigate(links.home)}
        aria-label="Home"
        aria-current={$currentRoute?.path === links.home ? 'page' : undefined}
    >
        <HomeIcon />
    </button>

    <button
        class="nav-button"
        class:active={$currentRoute?.path === links.collect}
        onclick={() => navigate(links.collect)}
        aria-label="Collect"
        aria-current={$currentRoute?.path === links.collect ? 'page' : undefined}
    >
        <CollectIcon />
    </button>

    <button
        class="nav-button"
        class:active={$currentRoute?.path === links.swap}
        onclick={() => navigate(links.swap)}
        aria-label="Receive"
        aria-current={$currentRoute?.path === links.swap ? 'page' : undefined}
    >
        <ReceiveIcon />
    </button>

    <button
        class="nav-button"
        class:active={$currentRoute?.path === links.history}
        onclick={() => navigate(links.history)}
        aria-label="History"
        aria-current={$currentRoute?.path === links.history ? 'page' : undefined}
    >
        <HistoryIcon />
    </button>

    <button
        class="nav-button"
        class:active={$currentRoute?.path === links.settings}
        onclick={() => navigate(links.settings)}
        aria-label="Settings"
        aria-current={$currentRoute?.path === links.settings ? 'page' : undefined}
    >
        <SettingsIcon />
    </button>
</nav>

<style lang="scss">
    .bottom-nav-bar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 64px;
        background-color: var(--color-cards-regular-base-default);
        border-top: 1px solid var(--color-cards-regular-border-default);
        z-index: 100;
        box-sizing: border-box;
    }

    .nav-button {
        flex: 1;
        height: 100%;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-content-icon-secondary);
        transition: background-color 0.2s ease, color 0.2s ease;
        -webkit-tap-highlight-color: transparent;

        &.active {
            color: var(--color-content-icon-accent-primary);
        }

        &:hover {
            background-color: var(--color-button-regular-quaternary-hover);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: -2px;
            border-radius: 4px;
        }

        :global(svg) {
            width: 24px;
            height: 24px;
            stroke-width: 2;
        }
    }
</style>
