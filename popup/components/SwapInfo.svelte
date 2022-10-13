<script lang="ts">
	import { _ } from 'popup/i18n';
  import Big from 'big.js';

	import dexStore from 'popup/store/dex';
  import currencyStore from 'popup/store/currency';
	import gasStore from 'popup/store/gas';
	import rateStore from 'popup/store/rate';

  import { setDexSettings } from 'popup/backend/settings';

	import { ZIlPayDex } from 'popup/mixins/dex';
	import { formatNumber } from 'popup/filters/n-format';
	import { convertRate } from 'popup/filters/convert-rate';


  Big.PE = 99;

	const dex = new ZIlPayDex();

  export let gasLimit = 0;
  export let pair;
  export let virtualParams;

	$: rate = $rateStore[$currencyStore];
  $: gasFee = ($gasStore.gasPrice * gasLimit * $gasStore.multiplier) / 10**6;
  $: feeConverted = convertRate(rate, gasFee);
  $: afterSlippage = dex.calcBigSlippage(pair[1].value, $dexStore.slippage);

  function hanldeSwpa() {
    console.log(virtualParams.impact);
  }

  const hanldeChangeSlippage = (event) => {
    const newSlippage = Number(event.target.value);

    setDexSettings($dexStore.blocks, newSlippage);
  }

  const hanldeChangeBlock = (event) => {
    const newBlocks = Number(event.target.value);

    setDexSettings(newBlocks, $dexStore.slippage);
  }
</script>

<div class="info">
  <ul>
    <li>
      <b>
        {$_('swap.info.rate')}
      </b>
      <p
        class="pointer"
        on:click={hanldeSwpa}
      >
        1 {pair[0].meta.symbol} = {virtualParams.rate.round(9)} {pair[1].meta.symbol} <span>({formatNumber(virtualParams.converted, $currencyStore)})</span>
      </p>
    </li>
    <li class:big={virtualParams.impact > 10}>
      <b>
        {$_('swap.info.price_impact')}
      </b>
      <p>
        {virtualParams.impact} <span>%</span>
      </p>
    </li>
    <li>
      <b>
        {$_('swap.info.fee')}
      </b>
      <p>
        {formatNumber(gasFee)}ZIL <span>({formatNumber(String(feeConverted), $currencyStore)})</span>
      </p>
    </li>
    <li>
      <b>
        {$_('swap.info.after_slippage')}
      </b>
      <p>
        {afterSlippage} {pair[1].meta.symbol}
      </p>
    </li>
    <li>
      <b>
        {$_('swap.info.slippage')}
      </b>
      <div>
        <input
          type="number"
          min="0"
          max="50"
          bind:value={$dexStore.slippage}
          on:input={hanldeChangeSlippage}
        />
        <b>
          %
        </b>
      </div>
    </li>
    <li>
      <b>
        {$_('swap.info.blocks')}
      </b>
      <div>
        <input
          type="number"
          min="1"
          bind:value={$dexStore.blocks}
          on:input={hanldeChangeBlock}
        />
        <b>
          {$_('swap.info.tx_blocks')}
        </b>
      </div>
    </li>
  </ul>
</div>

<style lang="scss">
	@import "../styles/mixins";

  div.info {
    background: var(--card-color);
    box-shadow: rgb(50 50 93 / 25%) 0px 2px 5px -1px, rgb(0 0 0 / 30%) 0px 1px 3px -1px;
    padding: 8px;
    width: 100%;

    @include border-radius(8px);

    & > ul {
      margin: 0;
      padding: 0;

      & > li {
        margin: 5px;

        @include flex-between-row;

        &.big {
          cursor: pointer;

          & > p,
          & > b,
          & > p > span {
            color: var(--danger-color);
          }
        }
        & > p,
        & > b {
          font-size: 8pt;
          font-family: Demi;
        }
        & > p {
          margin: 0;
          color: var(--text-color);

          &.pointer {
            cursor: pointer;
          }

          & > span {
            color: var(--muted-color);
          }
        }
        & > div {
          & > input {
            font-size: 8pt;
            text-align: right;
            padding: 0;
            height: 16px;
            width: 50px;
            border: none;
          }
        }
      }
    }
  }
</style>
