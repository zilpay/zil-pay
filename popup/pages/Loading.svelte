<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import Loader from '../components/Loader.svelte';
	import { getState } from "popup/backend";

	let state = null;

	onMount(async () => {
		state = await getState();
		const guard = state.guard;

		if (guard.isReady && guard.isEnable) {
			push('/home');
		} else if (guard.isReady && !guard.isEnable) {
			push('/lock');
		} else if (!guard.isReady) {
			push('/start');
		}
	});
</script>

<main>
	<h1>Loading!</h1>
	<Loader />
</main>

<style type="text/scss">
	@import "../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-column;
	}

	h1 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 22px, 55px);
	}
</style>
