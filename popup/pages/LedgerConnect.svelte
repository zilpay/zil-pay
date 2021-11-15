<script lang="ts">
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { AccountTypes } from 'config/account-type';
	import flyTransition from 'popup/transitions/fly';
  import {
    MIN_PASSWORD_LEN,
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_LEDGER_NAME
  } from 'popup/config/account';
	import walletStore from 'popup/store/wallet';
	import { createNextSeedAccount, balanceUpdate } from 'popup/backend/wallet';

  import NavClose from '../components/NavClose.svelte';
	import Loader from '../components/Loader.svelte';

  let lastIndex = $walletStore
    .identities
    .filter((acc) => acc.type === AccountTypes.Ledger)
    .length;
  let name = `${DEFAULT_LEDGER_NAME} ${lastIndex}`;
  let index = 0;
	let loading = false;

  $: disabled = loading || name.length < MIN_NAME_LEN;

  const handleSubmit = async (e) => {
    e.preventDefault();
  };
</script>

<main>
	<NavClose title={$_('ledger.title')}/>
  <form
    in:fly={flyTransition.in}
    on:submit={handleSubmit}
  >
    <label>
			<input
				bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
				placeholder={$_('setup_acc.name_placeholder')}
        required
			>
			<p>
				{$_('setup_acc.name_description')}
      </p>
		</label>
    <label>
			<input
				bind:value={index}
        type="number"
        maxlength={256}
        minlength={0}
				placeholder={$_('ledger.placeholder')}
        required
			>
			<p>
				{$_('ledger.info')}
      </p>
		</label>
    <button
      class="primary"
      disabled={disabled}
    >
      {#if loading}
        <span>
          <Loader
            width="25px"
            height="25px"
          />
        </span>
      {:else}
        {$_('ledger.btn')}
      {/if}
    </button>
  </form>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
  form {
    width: 100%;
    @include flex-center-column;

    & > label, button {
      width: 100%;
      max-width: 290px;
      margin: 10px;
    }
  }
</style>
