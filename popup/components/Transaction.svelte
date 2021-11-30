<script lang="ts">
  import { trim } from 'popup/filters/trim';
  import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';

  import rateStore from 'popup/store/rate';
	import currencyStore from 'popup/store/currency';

  export let tx;
  export let loading = false;

  $: amount = fromDecimals(tx.amount, tx.token.decimals).round(7);
  $: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, amount).round(7);
</script>

<div
  class="card"
  class:success={tx.confirmed && tx.success}
  class:error={tx.confirmed && !tx.success}
  class:loading={loading}
>
  <div>
    <h3>
      {tx.teg}
    </h3>
    <p>
      {trim(tx.recipient, 10)}
    </p>
  </div>
  <div>
    <h3>
      {formatNumber(amount, tx.token.symbol)}
    </h3>
    <p>
      {formatNumber(converted, $currencyStore)}
    </p>
  </div>
</div>

<style lang="scss">
  @import "../styles/mixins";
  div.card {
    cursor: pointer;

    min-width: 290px;
    background-color: var(--card-color);
    border-left: solid 5px var(--secondary-color);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include flex-between-row;
    @include border-radius(8px);

    &.success {
      border-left: solid 5px var(--success-color);
    }
    &.error {
      border-left: solid 5px var(--danger-color);
    }
    &.loading {
      @include loading-gradient(var(--background-color), var(--card-color));
    }
    & > div {
      padding-left: 10px;
      padding-right: 10px;

      &:last-child {
        text-align: right;
      }
      & > h3 {
        font-size: 10pt;
        margin-block-end: 0;
      }
      & > p {
        font-size: 8pt;
      }
    }
  }
</style>
