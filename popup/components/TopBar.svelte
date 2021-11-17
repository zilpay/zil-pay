<script lang="ts">
  import { link, location } from 'svelte-spa-router';
  import { trim } from 'popup/filters/trim';
  import { createEventDispatcher } from 'svelte';
  import { linksExpand } from 'popup/mixins/link';

  import Refresh from './icons/Refresh.svelte';
  import SvgLoader from './SvgLoader.svelte';

  const dispatch = createEventDispatcher();

  export let refresh = false;
  export let expand = true;

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
  <div class="icons-warp">
    {#if expand}
      <span
        class="expand"
        on:click={() => linksExpand($location)}
      >
        <SvgLoader
          src="/vectors/expand.svg"
          className="icon"
        />
      </span>
    {/if}
    {#if refresh}
      <span
        class="refresh"
        on:click={onRefresh}
      >
        <Refresh className="icon" />
      </span>
    {/if}
  </div>
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
      @include border-bottom-radius(8px);
    }
  }
  a.netwrok {
    height: 15px;
    width: 15px;

    margin: 11px;

    border-radius: 100%;
    background-color: var(--primary-color);
  }
  .icons-warp {
    text-align: end;
    width: 200px;
  }
  span {
    cursor: pointer;

    :global(svg.icon > path) {
      fill: var(--muted-color);
    }

    &:hover {
      :global(svg.icon > path) {
        fill: var(--primary-color);
      }
    }
  }
  span.refresh {
    margin: 11px;
  }
</style>
