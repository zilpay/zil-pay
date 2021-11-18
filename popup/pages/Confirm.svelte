<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';

	import TopBar from '../components/TopBar.svelte';
</script>

<section>
	<TopBar expand={false}/>
	<main in:scale>
	</main>
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 86px);
		@include flex-center-top-column;
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
