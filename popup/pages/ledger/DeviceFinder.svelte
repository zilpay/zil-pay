<script lang="ts">
  import { LEDGER_USB_VENDOR_ID, LEDGER_PRODUCT_ID_U2F } from 'config/ledger';

	import { push } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
  import { isHid } from 'popup/mixins/detect';

  import BackBar from '../../components/BackBar.svelte';
  import RefreshIcon from '../../components/icons/Refresh.svelte';

  let error = '';
  let loading = true;
  let accepted = false;
  let devices = [];

  const getHidTransport = async () => {
    loading = true;

    if (!isHid()) {
      push(`/ledger-connect/${LEDGER_PRODUCT_ID_U2F}`);
      return null;
    }

    try {
      devices = await window.navigator.hid.requestDevice({
        filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
      });
      devices = await window.navigator.hid.getDevices({
        filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
      });
      if (devices.length > 0) {
        accepted = true;
      }
    } catch (err) {
      console.error(err);
      
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <BackBar
    length={2}
    selected={0}
  />
  <h1>
    {$_('ledger_finder.title')}
  </h1>
  {#if !accepted}
    <button
      class="primary"
      on:click={getHidTransport}
    >
      {$_('ledger_finder.accept')}
    </button>
  {:else}
    <div class="list-header">
      <b>
        {$_('ledger_finder.list_title')}
      </b>
      <span on:click={getHidTransport}>
        <RefreshIcon className="refresh"/>
      </span>
    </div>
    <ul>
      {#each devices as device}
        <li
          in:fly={flyTransition.in}
          on:click={() => push(`/ledger-connect/${device.productId}`)}
        >
          <div class="ledger-card">
            <img
              src="/imgs/ledger.webp"
              alt="ledger"
              height="30"
            />
            <div>
              <h3>
                {device.productName}
              </h3>
              <p>
                ID:-{device.productId}
              </p>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style lang="scss">
	@import "../../styles/mixins";
  main {
		background-color: var(--background-color);
		height: 100vh;

    @include flex-center-top-column;
	}
  h1 {
    @include fluid-font(320px, 1024px, 22px, 55px);
  }
  .ledger-card {
    cursor: pointer;

    background-color: var(--card-color);
    padding: 5px;
    border: solid 1px var(--card-color);

    @include flex-between-row;
    @include border-radius(8px);

    & > img {
      margin: 10px;
    }
    & > div {
      width: 100%;

      & > h3,
      & > p {
        margin: 0;
      }
    }
    &:hover {
      border: solid 1px var(--primary-color);
    }
  }
  .list-header {
    width: 100%;
    max-width: 315px;
    @include flex-between-row;

    & > b {
      color: var(--text-color);
    }
    & > span {
      cursor: pointer;

      :global(svg.refresh > path) {
        fill: var(--text-color);
      }
      &:hover {
        :global(svg.refresh > path) {
          fill: var(--primary-color);
        }
      }
    }
  }
  ul {
    padding: 0;
    margin: 0;
    margin-block-start: 0;
    overflow-y: scroll;
		height: 100%;

    @include flex-center-top-column;

    & > li {
			min-width: 280px;
      max-width: 500px;
      width: 100%;
      margin-block-end: 5px;
    }
  }
  button {
    width: 290px;
  }
</style>
