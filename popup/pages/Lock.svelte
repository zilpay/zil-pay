<script lang="ts">
  import { tick, onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { unlockWallet } from "popup/backend";

	let inputEl;
	let password: string;
	let error: string | null = null;

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
			const guard = await unlockWallet(password);
			console.log(guard);
		} catch (err) {
			error = `${$_('lock.error')}-(${err.message})`;
		}
	}
</script>

<main>
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
		<button class="primary">
			{$_('lock.btn')}
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
