<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';

	import NavClose from '../../components/NavClose.svelte';
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('netwrok.title')}/>
</main>

<style type="text/scss">
  @import "../../styles/mixins";
  main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
  }
</style>
