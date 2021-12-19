<script lang="ts">
	import { pop, push } from 'svelte-spa-router';
	import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { createNextSeedAccount, restorePhrase } from "popup/backend/wallet";
  import wordsStore from 'popup/store/words';
  import {
    MIN_PASSWORD_LEN,
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_NAME
  } from 'popup/config/account';

  import BackBar from '../components/BackBar.svelte';
  import Toggle from '../components/Toggle.svelte';

	let loading = false;
  let name = `${DEFAULT_NAME} 0`;
	let error = '';
  let passError = '';
  let password: string;
  let confirmPassword: string;
  let accepted = false;

  $: disabled = loading || !password || confirmPassword !== password || name.length < MIN_NAME_LEN;

	onMount(() => {
    if ($wordsStore.length < 12) {
      return push('/create');
    }
  });

	const handleInputTextarea = () => {
		error = '';
	};
  const handleInputPassword = () => {
    passError = '';
	};
	const handleOnBlurPassword = () => {
    if (password && password.length < MIN_PASSWORD_LEN) {
      passError = $_('restore.pass_len_error');
    }
	};
  const handleSubmit = async (e) => {
		e.preventDefault();
    loading = true;

		try {
			const seed = $wordsStore.join(' ');
			await restorePhrase(seed, password);
      await createNextSeedAccount(name);
      push('/created');
			loading = false;
		} catch (err) {
			passError = err.message;
      loading = false;
		}
	}
</script>

<main in:fly={flyTransition.in}>
	<BackBar
    length={3}
    selected={2}
  />
	<h1>
    {$_('setup_acc.title')}
  </h1>
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
		<label>
      <input
        bind:value={password}
        class:error="{Boolean(passError)}"
        type="password"
        autocomplete="off"
        placeholder={$_('restore.pass_placeholder')}
        minlength={MIN_NAME_LEN}
        required
        on:input={handleInputPassword}
        on:blur={handleOnBlurPassword}
      >
      {passError}
    </label>
		<label>
			<input
				bind:value={confirmPassword}
				type="password"
        autocomplete="off"
				placeholder={$_('restore.conf_placeholder')}
				minlength={MIN_NAME_LEN}
				required
			>
			<p>
				{$_('setup_acc.pass_description')}
      </p>
		</label>
    <div class="policy">
      <a
        href="https://zilpay.io/extension-policy"
        target="_blank"
      >
        {$_('setup_acc.accept')}
      </a>
      <Toggle
        checked={accepted}
        on:toggle={() => accepted = !accepted}
      />
    </div>
    <button
			class="primary"
      class:loading={loading}
			disabled={disabled || !accepted}
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
  h1 {
    font-size: 35pt;
  }
  div.policy {
    width: 100%;
    max-width: 290px;

    @include flex-between-row;

    & > a {
      font-family: Demi;
      font-size: 13pt;
      color: var(--text-color);

      &:hover {
        color: var(--primary-color);
      }
    }
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
