<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
  import netStore from 'popup/store/netwrok';

	import NavClose from '../../components/NavClose.svelte';
	import MultiSwitcher from '../../components/MultiSwitcher.svelte';
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('netwrok.title')}/>
  <div>
    <MultiSwitcher
      items={Object.keys($netStore.config)}
      selected={0}
    />
  </div>
</main>

<style lang="scss">
  @import "../../styles/mixins";
  main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
  }
</style>
