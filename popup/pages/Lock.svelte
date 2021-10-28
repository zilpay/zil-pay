<script lang="ts">
  import { tick, onMount } from 'svelte';
	import { _ } from 'popup/i18n';

	let inputEl;
	let password: string;

	onMount(() => {
    if (focus) {
      inputEl.focus();
    }
  });

	const handleBlur = async (_) => {
    await tick();
    inputEl.focus();
  };
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(password);
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
				placeholder={$_('lock.placeholder')}
				on:blur={handleBlur}
			>
		</label>
		<button>
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
	}

	button {
		margin-top: 12px;
	}

	form {
		width: 290px;
		@include flex-center-column;
	}
</style>
