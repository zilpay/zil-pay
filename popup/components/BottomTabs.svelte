<script lang="ts">
  import { currentRoute } from '../store/route';
  import { push } from '../router/navigation';
  import HomeIcon from './icons/HomeIcon.svelte';
  import CollectIcon from './icons/CollectIcon.svelte';
  import SwapIcon from './icons/SwapIcon.svelte';
  import TimerIcon from './icons/TimerIcon.svelte';
  import GearIcon from './icons/Gear.svelte';

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
    onclick={() => navigate(links.home)}
    aria-label="Home"
    aria-current={$currentRoute?.path === links.home ? 'page' : undefined}
  >
    <HomeIcon selected={$currentRoute?.path === links.home} width="24" height="24" />
  </button>

  <button
    class="nav-button"
    onclick={() => navigate(links.collect)}
    aria-label="Collect"
    aria-current={$currentRoute?.path === links.collect ? 'page' : undefined}
  >
    <CollectIcon selected={$currentRoute?.path === links.collect} width="24" height="24" />
  </button>

  <button
    class="nav-button"
    onclick={() => navigate(links.swap)}
    aria-label="Swap"
    aria-current={$currentRoute?.path === links.swap ? 'page' : undefined}
  >
    <SwapIcon selected={$currentRoute?.path === links.swap} width="24" height="24" />
  </button>

  <button
    class="nav-button"
    onclick={() => navigate(links.history)}
    aria-label="History"
    aria-current={$currentRoute?.path === links.history ? 'page' : undefined}
  >
    <TimerIcon selected={$currentRoute?.path === links.history} width="24" height="24" />
  </button>

  <button
    class="nav-button"
    onclick={() => navigate(links.settings)}
    aria-label="Settings"
    aria-current={$currentRoute?.path === links.settings ? 'page' : undefined}
  >
    <GearIcon
      primary={$currentRoute?.path === links.settings}
      text={!($currentRoute?.path === links.settings)}
      width="24"
      height="24"
    />
  </button>
</nav>

<style lang="scss">
  .bottom-nav-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 60px;
    background-color: var(--card-background);
    border-top: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
    z-index: 100;
    box-sizing: border-box;

    @media (min-width: 480px) {
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }
  }

  .nav-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background-color: color-mix(in srgb, var(--primary-purple) 10%, transparent);
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      box-shadow:
        0 0 0 2px var(--background-color),
        0 0 0 4px var(--primary-purple);
    }
  }
</style>
