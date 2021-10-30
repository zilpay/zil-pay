<script lang="ts">
	import { pop, push } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { restorePhrase } from "popup/backend";

	import NavClose from '../components/NavClose.svelte';
	import Loader from '../components/Loader.svelte';

  const MIN_LEN = 6;

  let error = '';
  let passError = '';
  let words: string;
  let password: string;
  let confirmPassword: string;
	let loading = false;

	$: disabled = loading || !password || confirmPassword !== password;

  const handleSubmit = async (e) => {
		e.preventDefault();

		try {
      await restorePhrase(words, password);
      push('/setup-account');
			loading = true;
		} catch (err) {
			error = err.message;
		}
		loading = false;
	}
  const handleInputTextarea = () => {
		error = '';
	};
  const handleInputPassword = () => {
    passError = '';
	};
  const handleOnBlurPassword = () => {
    if (password && password.length < MIN_LEN) {
      passError = $_('restore.pass_len_error');
    }
	};
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('restore.title')}/>
  <form on:submit={handleSubmit}>
    <label>
      {error}
      <textarea
        bind:value={words}
        class:error="{Boolean(error)}"
        placeholder={$_('restore.placeholder')}
        required
        on:input={handleInputTextarea}
      />
    </label>
    <label>
      <input
        bind:value={password}
        class:error="{Boolean(passError)}"
        type="password"
        placeholder={$_('restore.pass_placeholder')}
        minlength={MIN_LEN}
        required
        on:input={handleInputPassword}
        on:blur={handleOnBlurPassword}
      >
      {passError}
    </label>
    <input
      bind:value={confirmPassword}
      type="password"
      placeholder={$_('restore.conf_placeholder')}
      minlength={MIN_LEN}
      required
    >
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

    & > input, button {
      max-width: 290px;
      margin: 10px;
    }
  }
  label {
    color: var(--danger-color);
		@include fluid-font(320px, 600px, 13px, 20px);
    @include flex-center-column;

    & > input {
      min-width: 290px;
    }
  }
  textarea {
    outline: none;
    resize: none;
    overflow: hidden;

    border-radius: 8px;
    padding: 14px;
    margin-bottom: 30px;
    box-sizing: border-box;

    height: calc(100vh - 600px);
    min-height: 200px;
    width: calc(100vw - 30px);
    max-width: 600px;

    background: var(--background-color);
    border-color: var(--text-color);
    color: var(--text-color);

		@include fluid-font(320px, 600px, 16px, 33px);

    &.error {
      color: var(--danger-color);
      border-color: var(--danger-color);
    }
  }
</style>
