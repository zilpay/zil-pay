<script lang="ts">
  import { tick, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import { unlockWallet } from "popup/backend";
	import flyTransition from 'popup/transitions/fly';

	import Loader from '../components/Loader.svelte';

	let inputEl;
	let password: string | null;
	let error = '';
	let loading = false;

	$: disabled = loading || !password;

	onMount(() => {
    if (inputEl && inputEl.focus) {
      inputEl.focus();
    }
  });

	const handleInput = () => {
		error = '';
	};
	const handleBlur = async (_) => {
    await tick();
		
    if (inputEl && inputEl.focus) {
      inputEl.focus();
    }
  };

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			loading = true;
			const state = await unlockWallet(password);

			if (state.guard.isEnable && state.guard.isReady) {
				loading = false;
				push('/');
			}
		} catch (err) {
			error = `${$_('lock.error')}-(${err.message})`;
		}
		loading = false;
	}
</script>

<main in:fly={flyTransition.in}>
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
				class:error={Boolean(error)}
				type="password"
				placeholder={$_('lock.placeholder')}
				on:blur={handleBlur}
				on:input={handleInput}
			>
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

<style lang="scss">
	@import "../styles/mixins";

	h1 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 22px, 55px);
	}

	img {
		max-width: 500px;
    width: calc(100vw - 90px);
	}

	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-column;
	}

	label {
		width: inherit;

		& > input.error {
			outline-color: var(--danger-color);
			animation: shake .4s linear;
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
