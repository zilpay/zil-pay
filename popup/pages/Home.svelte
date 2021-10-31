<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import flyTransition from 'popup/transitions/fly';
	import barsStore from 'app/store/bars';

	onMount(() => {
		barsStore.set(true);
	});
</script>

<main
	in:fly={flyTransition.in}
	out:fly={flyTransition.out}
>
</main>

<style type="text/scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: calc(100vh - 96px);

		@include flex-center-column;
	}
</style>
