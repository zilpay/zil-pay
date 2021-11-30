<script lang="ts">
	import { _ } from 'popup/i18n';
	import { push } from 'svelte-spa-router';

  import { trim } from 'popup/filters/trim';
  import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';
  import { viewTransaction } from 'lib/block-explorer/view';
  import { openTab } from 'popup/mixins/link';
  import { clipboardCopy } from 'lib/utils/clipboard';
  import { repeatTx, cancelTx } from 'popup/mixins/tx-build';

  import rateStore from 'popup/store/rate';
	import currencyStore from 'popup/store/currency';
  import netStore from 'popup/store/netwrok';

  import Tooltip from '../components/Tooltip.svelte';

  export let tx = {};

  let tip = $_('home.clipboard.copy');

  $: amount = fromDecimals(tx.amount, tx.token.decimals).round(7);
  $: hash = `0x${tx.hash}`;
  $: operate = Number(tx.amount) > 0 ? '-' : '';

	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, amount.add(tx.fee)).round(7);

  function hanldeOnCopy(content: string) {
    clipboardCopy(content);
    tip = $_('home.clipboard.copied');
    setTimeout(() => {
      tip = $_('home.clipboard.copy');
    }, 500);
  }

  const hanldeOnViewBlock = () => {
    const url = viewTransaction(hash, $netStore.selected);
    openTab(url);
  };
  const hanldeOnRepeat = async () => {
    await repeatTx(tx);
    push('/confirm/');
  };
  const hanldeOnCancel = async () => {
    await cancelTx(tx);
    push('/confirm/');
  };
</script>

<div class="tx">
  {#if tx.icon}
    <img
      src={tx.icon}
      alt={tx.title}
      width="30"
    />
  {/if}
  <h1>
    {operate} {formatNumber(amount, tx.token.symbol)}
  </h1>
  <div class="header">
    <p>
      {formatNumber(converted, $currencyStore)}
    </p>
    <p>
      ZIL {tx.fee}
    </p>
  </div>
  <ul class:loading={!tx.confirmed}>
    <li>
      <span>
        {tx.title}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.from')}
      </span>
      <Tooltip
        tip={tip}
        bottom
      >
        <span
          class="pointer"
          on:click={() => hanldeOnCopy(tx.from)}
        >
          {trim(tx.from)}
        </span>
      </Tooltip>
    </li>
    <li>
      <span>
        {$_('history.modals.details.recipient')}
      </span>
      <span>
        {trim(tx.recipient)}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.method')}
      </span>
      <span>
        {tx.teg}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.hash')}
      </span>
      <Tooltip
        tip={tip}
        bottom
      >
        <span
          class="pointer"
          on:click={() => hanldeOnCopy(hash)}
        >
          {trim(hash, 10)}
        </span>
      </Tooltip>
    </li>
    <li>
      <span>
        {$_('history.modals.details.nonce')}
      </span>
      <span>
        {tx.nonce}
      </span>
    </li>
    <li>
      <span>
        {$_('history.modals.details.time')}
      </span>
      <span>
        {new Date(tx.timestamp).toLocaleString()}
      </span>
    </li>
    {#if tx.info}
      <li>
        <span>
          {$_('history.modals.details.info')}
        </span>
        <span>
          {tx.info}
        </span>
      </li>
    {/if}
  </ul>
  <div class="btns">
    <button
      class="primary"
      on:click={hanldeOnViewBlock}
    >
      {$_('history.modals.details.btns.view')}
    </button>
    {#if tx.confirmed}
      <button
        class="warning"
        on:click={hanldeOnRepeat}
      >
        {$_('history.modals.details.btns.repeat')}
      </button>
    {:else}
      <button
        class="warning"
        on:click={hanldeOnCancel}
      >
        {$_('history.modals.details.btns.cancel')}
      </button>
    {/if}
  </div>
</div>

<style lang="scss">
	@import "../styles/mixins";
  div.tx {
    height: 600px;
    @include flex-center-top-column;
  }
  h1 {
    line-height: 0;
    margin: 0;
    @include fluid-font(320px, 1024px, 25px, 35px);
  }
  div.header {
    width: fit-content;
    @include flex-between-row;

    & > p {
      min-width: 70px;
      font-size: 16px;

      &:last-child {
        text-align: right;
			}
    }
  }
  div.btns {
    width: 100%;
    max-width: 300px;
    @include flex-between-row;

    & > button {
      margin: 5px;
    }
  }
  span.pointer {
    cursor: pointer;
    font-family: Demi;
  }
  img {
    margin: 10px;
  }
  ul {
    min-width: 300px;
    max-width: 490px;
    width: calc(100vw - 20px);

    padding: 10px;
    background-color: var(--card-color);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include border-radius(8px);

    &.loading {
      @include loading-gradient(var(--background-color), var(--card-color));
    }
    & > li {
      padding: 5px;
      border-bottom: solid 1px var(--border-color);
      font-family: Regular;
      color: var(--text-color);

      @include fluid-font(320px, 1024px, 16px, 20px);
      @include flex-between-row;

      &:last-child {
				border-bottom: solid 1px transparent;
			}
      & > span {
        @include text-shorten;
      }
      & > span:last-child {
				font-family: Demi;
			}
    }
  }
</style>
