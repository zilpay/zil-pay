<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
  import { fetchNFTToken, addNFTToken } from 'popup/backend/tokens';
  import { trim } from 'popup/filters/trim';
  import { viewIcon } from 'lib/block-explorer/view';

	import format from 'popup/store/format';
  import themeStore from 'popup/store/theme';

  const dispatch = createEventDispatcher();

	let inputEl;
  let loading = false;
  let address = '';
  let error = '';
  let state = null;

  $: disabled = loading || !address;

  const handleSubmit = async (e) => {
		e.preventDefault();

		loading = true;
    try {
      state = await fetchNFTToken(address);
    } catch (err) {
      console.error(err);
      error = err.message;
    }
		loading = false;
	};
  const addToken = async () => {
    loading = true;
    try {
      await addNFTToken(state);
      dispatch('close');
    } catch (err) {
      console.error(err);
      error = err.message;
    }
    loading = false;
  };

  onMount(() => {
    if (inputEl && inputEl.focus) {
      inputEl.focus();
    }
  });
</script>

<div class="wrapper">
  <h2 class="error">
    {error}
  </h2>
  {#if state}
    <img
      src={viewIcon(state.bech32, $themeStore)}
      alt={state.symbol}
      height="78px"
    />
    <ul in:scale>
      <li>
        <span>
          {$_('tokens_list.modals.add.symbol')}
        </span>
        <div>
          {state.symbol}
        </div>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.name')}
        </span>
        <div>
          {state.name}
        </div>
      </li>
      <li>
        <span>
          {$_('tokens_list.modals.add.balance')}
        </span>
        <div>
          {state.balances.length}
        </div>
      </li>
    </ul>
    <button
      disabled={loading}
      class:loading={loading}
      on:click={addToken}
    >
      {$_('collections.modals.add_btn')}
    </button>
  {:else}
    <form
      autocomplete="off"
      on:submit={handleSubmit}
    >
      <label>
        <input
          bind:this={inputEl}
          bind:value={address}
          type="text"
          autocomplete="off"
          autocorrect="off"
          class:loading={loading}
          disabled={loading}
          placeholder={$_('tokens_list.modals.add.placeholder')}
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
  h2.error {
    color: var(--danger-color);
    font-size: 16px;
  }
  ul {
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
        text-align: right;
			}
    }
  }
  form {
    @include flex-center-top-column;
  }
  label,
  button {
    margin: 10px;
    width: 290px;
  }
</style>
