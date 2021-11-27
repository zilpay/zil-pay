<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
  import { fromBech32 } from 'popup/backend/settings';
  import { getZRC2State, addZRC2Token } from 'popup/backend/tokens';
  import { trim } from 'popup/filters/trim';
  import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';
  import { viewIcon } from 'lib/block-explorer/view';

	import format from 'popup/store/format';
  import rateStore from 'popup/store/rate';
	import currencyStore from 'popup/store/currency';
  import themeStore from 'popup/store/theme';
	import zrcStore from 'popup/store/zrc';

  const dispatch = createEventDispatcher();

  let loading = false;
  let address = '';
  let error = '';
  let state = null;
  let amount = '0';
  let converted = '0';
  let img = '';

  let disabled = true;

  $: ZIL = $zrcStore[0];
  $: rate = $rateStore[$currencyStore];

  async function hanldeOnInput() {
    try {
      await fromBech32(address);
      disabled = false;
    } catch {
      disabled = true;
    }
  }

  const handleSubmit = async (e) => {
		e.preventDefault();

		loading = true;
    try {
      state = await getZRC2State(address);
      amount = fromDecimals(state.balance, state.decimals).round(7);
      const zils = amount.mul(state.rate);
      converted = convertRate(state.rate, zils).round(7);
      img = viewIcon(state.bech32, $themeStore);
    } catch (err) {
      console.error(err);
      error = err.message;
    }
		loading = false;
	};
  const addToken = async () => {
    loading = true;
    try {
      await addZRC2Token(state);
      dispatch('close');
    } catch (err) {
      console.error(err);
      error = err.message;
    }
    loading = false;
  };
</script>

<div class="wrapper">
  {#if state}
    <img
      src={img}
      alt={state.symbol}
      height="78px"
    />
    <ul in:scale>
      <li>
        <span>
          {$_('tokens_list.modals.add.rate')}
        </span>
        <div>
          <span>
            {state.rate}
          </span>
          <p>
            {formatNumber(converted, $currencyStore)}
          </p>
        </div>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.balance')}
        </span>
        <span>
          {formatNumber(amount)}
        </span>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.address')}
        </span>
        <span>
          {trim(state[$format])}
        </span>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.decimals')}
        </span>
        <span>
          {state.decimals}
        </span>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.name')}
        </span>
        <span>
          {state.name}
        </span>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.symbol')}
        </span>
        <span>
          {state.symbol}
        </span>
      </li>
    </ul>
    <button
      disabled={loading}
      class:loading={loading}
      on:click={addToken}
    >
      {$_('tokens_list.modals.add.btns.add')}
    </button>
  {:else}
    <form on:submit={handleSubmit}>
      <label>
        <input
          bind:value={address}
          type="text"
          class:loading={loading}
          disabled={loading}
          placeholder={$_('tokens_list.modals.add.placeholder')}
          on:input={hanldeOnInput}
        />
      </label>
      <button
        disabled={disabled || loading}
        class:loading={loading}
      >
        {$_('tokens_list.modals.add.btns.fetch')}
      </button>
    </form>
  {/if}
</div>

<style lang="scss">
	@import "../styles/mixins";
  div.wrapper {
    padding: 30px;
    height: 600px;
    @include flex-center-top-column;
  }
  ul {
    list-style: none;
    min-width: 300px;
    max-width: 490px;
    width: calc(100vw - 20px);

    padding: 10px;
    background-color: var(--card-color);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include border-radius(8px);

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
      & > div > p {
        margin: 0;
      }
    }
  }
  form {
    @include flex-center-top-column;
  }
  label,
  button {
    margin: 10px;
    min-width: 290px;
    max-width: 400px;
    width: 100%;
  }
</style>
