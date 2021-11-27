<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';

  import rateStore from 'popup/store/rate';
	import currencyStore from 'popup/store/currency';

  import themeStore from 'popup/store/theme';
	import zrcStore from 'popup/store/zrc';

  const dispatch = createEventDispatcher();

  export let address: string;
  export let balance: string;
  export let symbol: string;
  export let decimal: number;
  export let loading = false;
  export let tokenRate = 0;

  $: img = viewIcon(address, $themeStore);
  $: balance = fromDecimals(balance, decimal).round(7);
  $: zils = balance.mul(tokenRate);
	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, zils).round(7);

  const onClick = () => {
    dispatch('select');
  };
</script>

<div
  class="token-card"
  class:loading={loading}
  on:click={onClick}
>
  <div>
    <p class="symbol">
      {symbol}
    </p>
    <p class="balance">
      {formatNumber(balance)}
    </p>
    <p class="conv">
      {formatNumber(converted, $currencyStore)}
    </p>
  </div>
  <div class="img-wrapper">
    <img
      src={img}
      alt={symbol}
      width="28"
      height="28"
    />
  </div>
</div>

<style lang="scss">
  @import "../styles/mixins";
  div.token-card {
    cursor: pointer;

    padding: 12px;
    margin: 3px;
    width: 142px;

    border: solid 2px var(--card-color);
    background-color: var(--card-color);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include flex-between-row;
    @include border-radius(8px);

    &.loading {
      @include loading-gradient(var(--background-color), var(--card-color));
    }
    &:hover {
      border-color: var(--primary-color);
    }
  }
  p.symbol {
    font-size: 16px;
    line-height: 0;
    margin-block-end: 20px;
    font-family: Demi;
  }
  p.balance {
    font-size: 13px;
    line-height: 0px;
    font-family: Bold;
    color: var(--text-color);
    margin-block-end: 10px;
    margin-block-start: 30px;
  }
  p.conv {
    font-size: 12px;
    line-height: 5px;
  }
  div.img-wrapper {
    height: 100%;
  }
</style>
