<script lang="ts">
  import { location, link } from 'svelte-spa-router';

  import CollectIcon from './CollectIcon.svelte';
  import GearIcon from './GearIcon.svelte';
  import HomeIcon from './HomeIcon.svelte';
  import SwapIcon from './SwapIcon.svelte';
  import TimerIcon from './TimerIcon.svelte';

  const links = {
    home: '/',
    settings: '/settings',
    collect: '/collect',
    history: '/history',
    swap: '/swap'
  };
</script>

<nav>
  <a
    href={links.home}
    use:link
  >
    <HomeIcon selected={$location === links.home}/>
  </a>
  <a
    href={links.collect}
    use:link
  >
    <CollectIcon selected={$location === links.collect}/>
  </a>
  <a
    href={links.swap}
    use:link
  >
    <SwapIcon selected={$location === links.swap}/>
  </a>
  <a
    href={links.history}
    use:link
  >
    <TimerIcon selected={$location === links.history}/>
  </a>
  <a
    href={links.settings}
    use:link
  >
    <GearIcon selected={$location === links.settings}/>
  </a>
</nav>

<style lang="scss">
  @import "../styles";
  nav {
    max-width: 320px;
    height: 50px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    justify-content: space-around;
    @include flex-center-vert;

    @media screen and (min-width: 400px) {
      border-top-left-radius: $default-border-radius;
      border-top-right-radius: $default-border-radius;
    }
  }
</style>
