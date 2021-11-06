<script lang="ts">
  import { link } from 'svelte-spa-router';
  import { trim } from 'popup/filters/trim';
  import { createEventDispatcher } from 'svelte';

  import Refresh from './icons/Refresh.svelte';

  const dispatch = createEventDispatcher();

  export let refresh = false;

  const onRefresh = () => {
    dispatch('refresh');
  };
</script>

<nav>
  <a
    class="netwrok"
    href="/netwrok"
    use:link
  >
    <span />
  </a>
  {#if refresh}
    <span
      class="refresh"
      on:click={onRefresh}
    >
      <Refresh />
    </span>
  {/if}
</nav>

<style lang="scss">
  @import "../styles/mixins";
  nav {
    max-width: 900px;
    height: 36px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    @include flex-between-row;

    @media screen and (min-width: 899px) {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
  a.netwrok {
    height: 15px;
    width: 15px;

    margin: 11px;

    border-radius: 100%;
    background-color: var(--primary-color);
  }
  span.refresh {
    cursor: pointer;
    margin: 11px;
  }
</style>
