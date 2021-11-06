<script lang="ts">
  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';

  import rateStore from 'popup/store/rate';
	import currencyStore from 'popup/store/currency';

  import themeStore from 'popup/store/theme';
	import zrcStore from 'popup/store/zrc';

  export let address: string;
  export let balance: string;
  export let symbol: string;
  export let decimal: number;

  $: img = viewIcon(address, $themeStore);
  $: balance = fromDecimals(balance, decimal).round(7);
	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, balance).round(7);
</script>

<div class="token-card">
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
    margin: 9px;
    width: 142px;
    border-radius: 6px;
    background-color: var(--card-color);
    box-shadow: 0 5px 5px 0 rgb(0 0 0 / 10%), 0 6px 5px 0 rgb(0 0 0 / 19%);

    @include flex-between-row;

    &:hover {
      transition: all 150ms linear;

      opacity: 0.7;
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
