<script lang="ts">
  import { location } from 'svelte-spa-router';

  import CollectIcon from './CollectIcon.svelte';
  import GearIcon from './GearIcon.svelte';
  import HomeIcon from './HomeIcon.svelte';
  import SwapIcon from './SwapIcon.svelte';
  import TimerIcon from './TimerIcon.svelte';
</script>

<nav>
  <HomeIcon selected={$location === '/home'}/>
  <CollectIcon />
  <SwapIcon />
  <TimerIcon />
  <GearIcon />
</nav>

<style type="text/scss">
  @import "../styles/mixins";
  nav {
    max-width: 320px;
    height: 60px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    justify-content: space-around;
    @include flex-center-vert;

    @media screen and (min-width: 400px) {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  }
</style>
