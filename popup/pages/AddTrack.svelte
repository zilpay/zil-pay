<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { AccountTypes } from 'config/account-type';
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_TRACK_NAME
  } from 'popup/config/account';
	import walletStore from 'popup/store/wallet';
	import { addAccountTracker } from 'popup/backend/wallet';
  import { getZNS } from 'app/backend/zns';

  import NavClose from '../components/NavClose.svelte';

  let lastIndex = $walletStore
    .identities
    .filter((acc) => acc.type === AccountTypes.Track)
    .length;
  let name = `${DEFAULT_TRACK_NAME} ${lastIndex}`;
	let loading = false;
  let loadingZNS = false;
  let addressError = '';
  let address = '';

  $: disabled = loading || name.length < MIN_NAME_LEN || !address;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    addressError = '';
    loading = true;
    try {
      await addAccountTracker(address, name);
      push('/');
    } catch (err) {
      addressError = err.message;
    }
    loading = false;
  };

  async function onInput(e) {
    addressError = '';
    const { value } = e.target;
    const regExpDomain = /.*\w.zil/gm;

    if (regExpDomain.test(value)) {
      loadingZNS = true;
      try {
        const resolver = await getZNS(value);
        if (resolver.address) {
          address = resolver.address.bech32;
          name = value;
        } else {
          address = resolver.owner.bech32;
        }
      } catch (err) {    
        addressError = err.message;
        address = '';
      }
      loadingZNS = false;
    }
  }
</script>

<main>
	<NavClose title={$_('account_track.title')}/>
  <form on:submit={handleSubmit}>
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
    <label class:error={addressError}>
      {addressError}
      <input
        bind:value={address}
        class:loading={loadingZNS}
        class:error={addressError}
        disabled={loadingZNS}
        placeholder={$_('send.input_to.placeholder')}
        on:input={onInput}
      >
      <p>
				{$_('account_track.description')}
      </p>
    </label>
    <button
      class="primary"
      class:loading={loading}
      disabled={disabled}
    >
      {$_('restore.btn')}
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
