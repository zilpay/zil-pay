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

	import Loader from '../components/Loader.svelte';
  import BackBar from '../components/BackBar.svelte';

	let loading = false;
  let name = `${DEFAULT_NAME} 0`;
	let error = '';
  let passError = '';
  let password: string;
  let confirmPassword: string;

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

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
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
				placeholder={$_('restore.conf_placeholder')}
				minlength={MIN_NAME_LEN}
				required
			>
			<p>
				{$_('setup_acc.pass_description')}
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
				{$_('restore.btn')}
			{/if}
		</button>
  </form>
</main>

<style type="text/scss">
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
