<script lang="ts">
  import { link, location } from 'svelte-spa-router';
  import { trim } from 'popup/filters/trim';
  import { createEventDispatcher } from 'svelte';
  import { linksExpand, openTab } from 'popup/mixins/link';
  import { viewAddress } from 'lib/block-explorer/view';

  import Refresh from './icons/Refresh.svelte';
  import SvgLoader from './SvgLoader.svelte';

	import walletStore from 'popup/store/wallet';
  import netStore from 'popup/store/netwrok';

  const dispatch = createEventDispatcher();

  export let refresh = false;
  export let expand = true;
  export let view = false;

  $: account = $walletStore.identities[$walletStore.selectedAddress];

  const onRefresh = () => {
    dispatch('refresh');
  };
  const viewOnViewBlock = () => {
    const url = viewAddress(account.bech32, $netStore.selected);
    openTab(url);
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
    {#if view}
      <span
        class="view"
        on:click={viewOnViewBlock}
      >
        <SvgLoader
          src="/vectors/view.svg"
          className="icon-view"
        />
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

    &.view {
      margin-right: 10px;
    }
    .refresh {
      margin: 10px;
    }

    :global(svg.icon > path) {
      fill: var(--muted-color);
    }

    &:hover {
      :global(svg.icon-view > circle) {
        stroke: var(--primary-color);
      }
      :global(svg.icon-view > line) {
        stroke: var(--primary-color);
      }
      :global(svg.icon-view > path) {
        stroke: var(--primary-color);
      }
      :global(svg.icon > path) {
        fill: var(--primary-color);
      }
    }
  }
</style>
