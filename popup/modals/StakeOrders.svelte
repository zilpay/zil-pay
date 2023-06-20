<script lang="ts">
  import type { ZRC2Token } from 'types/token';

	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';

  import blocknumber from 'app/store/blocknumber';

  import { fromDecimals } from 'popup/filters/units';
  import { formatNumber } from 'popup/filters/n-format';

  export let delayBlock = 0;
  export let identities = [];
  export let stZIL: ZRC2Token;
  export let ZIL: ZRC2Token;

  function getPercent(block: number) {
    const left = (block + delayBlock) - $blocknumber;

    if (left <= 0) {
      return 0;
    }

    return 100 - (left * 100 / delayBlock);
  }
</script>

<ul>
	{#each identities as order, index}
		<li
      in:fly={{
        delay: 100 * index,
        duration: 400,
        y: -20
      }}
    >
      <div>
        <h2>
          {$_('stake.modals.withdrawals.withdrawal')} {index + 1}
        </h2>
        <div class="progress">
          <span style={`width: ${getPercent(Number(order.block))}%;`}/>
        </div>
        <b class="amount">
          {formatNumber(
            fromDecimals(order.st, stZIL.decimals),
            stZIL.symbol
          )} / <span>{formatNumber(
            fromDecimals(order.zil, ZIL.decimals),
            ZIL.symbol
          )}</span>
        </b>
      </div>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import "../styles";
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;
		padding-block-end: 70px;
		padding-block-start: 10px;

		max-width: 390px;
		width: 100%;
    min-height: 450px;

    padding-left: 5px;
    padding-right: 5px;

		& > li {
      padding: 1px;
      background: linear-gradient(95.25deg, rgb(51, 227, 206) 1.47%, rgb(135, 117, 231) 80.7%);

      margin: 5px;

			@include border-radius($default-border-radius);

      & > div {
        padding: 16px;
        background-color: var(--card-color);

        @include border-radius($default-border-radius);

        & > h2 {
          font-size: 16pt;
          line-height: 0;
          margin: 0;
          margin-block-start: 8px;
          margin-block-end: 15px;
        }
      }
		}
	}
  div.progress {
    display: flex;

    margin: 8px;
    height: 21px;

    border: 1px solid var(--primary-color);

    @include border-radius($default-border-radius);

    & > span {
      background-color: var(--primary-color);

      @include loading-gradient(var(--secondary-color), var(--primary-color));
      @include border-radius($default-border-radius);
    }
  }
  b.amount {
    color: var(--secondary-color);

    & > span {
      color: var(--primary-color);
    }
  }
</style>
