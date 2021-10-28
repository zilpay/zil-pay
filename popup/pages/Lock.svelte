<script lang="ts">
  import { tick, onMount } from 'svelte';

	let inputEl;

	onMount(() => {
    if (focus) {
      inputEl.focus();
    }
  });

	const handleBlur = async (_) => {
    await tick();
    inputEl.focus();
  };
</script>

<main>
	<img src="/imgs/logo.webp" >
	<h1>Welcome back</h1>
	<input
		bind:this={inputEl}
		on:blur={handleBlur}
	>
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
</style>
