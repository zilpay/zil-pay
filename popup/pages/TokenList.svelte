<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
</script>

<section
	in:fly={flyTransition.in}
	out:fly={flyTransition.out}
>
	<TopBar />
	<main>
		<button>
			{$_('home.token_list')}
		</button>
	</main>
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 96px);
		z-index: 3;

		@include flex-center-top-column;
	}
</style>
