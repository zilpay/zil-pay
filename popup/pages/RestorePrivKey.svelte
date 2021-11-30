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
    DEFAULT_KEY_NAME
  } from 'popup/config/account';
	import walletStore from 'popup/store/wallet';
	import { importPrivateKey } from 'popup/backend/wallet';

  import NavClose from '../components/NavClose.svelte';

  let error = '';
  let key = '';
  let lastIndex = $walletStore
    .identities
    .filter((acc) => acc.type === AccountTypes.PrivateKey)
    .length;
  let name = `${DEFAULT_KEY_NAME} ${lastIndex}`;
	let loading = false;

  $: disabled = loading || name.length < MIN_NAME_LEN || key.length !== 64;

  const handleInputTextarea = () => {
		error = '';
	};
  const handleSubmit = async (e) => {
    e.preventDefault();
    loading = true;

		try {
      await importPrivateKey(key, name);
		} catch (err) {
      error = String(err.message);
      loading = false;
      return null;
		}

    try {
      await balanceUpdate();
    } catch {
      ///
    }
    push('/');
    loading = false;
  };
</script>

<main>
	<NavClose title={$_('import_priv_key.title')}/>
  <form
    in:fly={flyTransition.in}
    on:submit={handleSubmit}
  >
    <label class:error="{Boolean(error)}">
      {error}
      <textarea
        bind:value={key}
        class:error="{Boolean(error)}"
        placeholder={$_('import_priv_key.placeholder')}
        required
        on:input={handleInputTextarea}
      />
    </label>
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
  textarea {
    width: calc(100vw - 30px);
  }
  form {
    width: calc(100vw - 30px);
    @include flex-center-column;
  }
  input {
    width: 100%;
  }
  button {
    max-width: 290px;
  }
  label {
    @include flex-column;
  }
</style>
