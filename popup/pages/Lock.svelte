<script lang="ts">
  import { tick, onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import { unlockWallet } from "popup/backend";
	import fade from 'popup/transitions/fade';

	import Loader from '../components/Loader.svelte';

	let inputEl;
	let password: string | null;
	let error: string | null = null;
	let loading = false;

	$: disabled = loading || !password;

	onMount(() => {
    if (focus) {
      inputEl.focus();
    }
  });

	const handleInput = () => {
		error = null;
	};
	const handleBlur = async (_) => {
    await tick();
    inputEl.focus();
  };

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			loading = true;
			const state = await unlockWallet(password);

			if (state.guard.isEnable && state.guard.isReady) {
				loading = false;
				push('/home');
			}
		} catch (err) {
			error = `${$_('lock.error')}-(${err.message})`;
		}
		loading = false;
	}
</script>

<main
	in:fade.in
	out:fade.out
>
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<h1>
		{$_('lock.title')}
	</h1>
	<form on:submit={handleSubmit}>
		<label>
			<input
				bind:this={inputEl}
				bind:value={password}
				type="password"
				placeholder={$_('lock.placeholder')}
				on:blur={handleBlur}
				on:input={handleInput}
			>
			<span>
				{error || ''}
			</span>
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
				{$_('lock.btn')}
			{/if}
		</button>
	</form>
</main>

<style type="text/scss">
	@import "../styles/mixins";

	h1 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 22px, 55px);
	}

	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-column;
	}

	label {
		width: inherit;

		span {
			width: inherit;
			color: var(--danger-color);
			@include text-shorten;
		}
	}

	button {
		margin-top: 12px;
	}

	form {
		width: 290px;
		@include flex-center-column;
	}
</style>
