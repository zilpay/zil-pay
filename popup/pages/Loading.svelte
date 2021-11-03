<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import Loader from '../components/Loader.svelte';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';

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

<main
	in:fly={flyTransition.in}
	out:fly={flyTransition.out}
>
	<h1>
		{$_('loading.title')}
	</h1>
	<Loader />
</main>

<style lang="scss">
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
