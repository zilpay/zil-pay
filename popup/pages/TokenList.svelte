<script lang="ts">
	import { _ } from 'popup/i18n';
	import { scale } from 'svelte/transition';

  import NavClose from '../components/NavClose.svelte';
</script>

<main in:scale>
	<NavClose title={$_('tokens_list.title')}/>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
</style>
