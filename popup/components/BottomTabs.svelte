<script lang="ts">
    import { currentRoute } from '../store/route';
    import { push } from '../router/navigation';
    import HomeIcon from './icons/Home.svelte';
    import GridIcon from './icons/Grid.svelte';
    import ArrowDownIcon from './icons/ArrowDown.svelte';
    import HistoryIcon from './icons/History.svelte';
    import SettingsIcon from './icons/Settings.svelte';

    const tabs = [
        { path: '/', component: HomeIcon, },
        { path: '/collect', component: GridIcon, },
        { path: '/swap', component: ArrowDownIcon, },
        { path: '/history', component: HistoryIcon, },
        { path: '/settings', component: SettingsIcon, }
    ];

    function navigate(path: string) {
        if ($currentRoute?.path !== path) {
            push(path);
        }
    }
</script>

<nav class="bottom-nav-bar">
    {#each tabs as tab (tab.path)}
        <button
            class="nav-button"
            class:active={$currentRoute?.path === tab.path}
            onclick={() => navigate(tab.path)}
            aria-current={$currentRoute?.path === tab.path ? 'page' : undefined}
        >
            <svelte:component this={tab.component} />
        </button>
    {/each}
</nav>

<style lang="scss">
    .bottom-nav-bar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 45px;
        background-color: var(--color-navbar-backgrdound-fg);
        z-index: 100;
        box-sizing: border-box;
        flex-shrink: 0;
    }


    :global(.active > svg > path) {
        stroke: var(--color-navbar-icon-selected-default);
    }

    :global(svg > path) {
        stroke: var(--color-navbar-icon-default-default);
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
        color: var(--color-navbar-icon-default-default);
        transition: color 0.2s ease;
        -webkit-tap-highlight-color: transparent;

        :global(svg) {
            width: 28px;
            height: 28px;
        }
    }
</style>
