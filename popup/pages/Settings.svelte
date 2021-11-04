<script lang="ts">
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';

  import TopBar from '../components/TopBar.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
</script>

<section
	in:fly={flyTransition.in}
	out:fly={flyTransition.out}
>
	<TopBar />
	<main>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 96px);
		z-index: 3;

		@include flex-center-top-column;
	}
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
