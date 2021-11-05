<script lang="ts">
  import { trim } from 'popup/filters/trim';
  import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';

  import zrcStore from 'popup/store/zrc';
  import rateStore from 'popup/store/rate';
	import currencyStore from 'popup/store/currency';

  export let account;
  export let selected = false;

  $: ZIL = $zrcStore[0];
  $: balance = fromDecimals(account.zrc2[ZIL.base16], ZIL.decimals).round();
	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, balance).round();
</script>

<div class="wrapper">
  <div
    class="radio"
    class:selected={selected}
  >
    {#if selected}
      <span />
    {/if}
  </div>
  <div>
    <h2>
      {account.name}
    </h2>
    <p>
      {trim(account.bech32)}
    </p>
  </div>
</div>
<div>
  <h2>
    {formatNumber(balance, ZIL.symbol)}
  </h2>
  <p class="converted">
    {formatNumber(converted, $currencyStore)}
  </p>
</div>

<style lang="scss">
	@import "../styles/mixins";
	h2 {
		color: var(--text-color);
		margin-block-end: 0;
		margin-block-start: 0.8em;
    font-size: 16px;

    @include text-shorten;
	}
  p {
    color: var(--muted-color);
		margin-block-end: 0.8;
		margin-block-start: 0em;
    font-size: 12px;

    &.converted {
      text-transform: uppercase;
    }
  }
  div.radio {
    width: 20px;
    height: 20px;
    background: var(--background-color);
    border: solid 3px var(--background-color);
    border-radius: 100%;
    margin-right: 15px;

    &.selected {
      border: solid 3px var(--background-color);
      background: var(--primary-color);
    }
  }
  div.wrapper {
    @include flex-between-row;
  }
</style>
