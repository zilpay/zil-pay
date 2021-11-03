<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
  import netStore from 'popup/store/netwrok';
  import { selectNetwrok } from 'popup/backend/netwrok';

	import NavClose from '../../components/NavClose.svelte';
	import MultiSwitcher from '../../components/MultiSwitcher.svelte';

  $: keys = Object.keys($netStore.config);
  $: selected = keys.findIndex((n) => n === $netStore.selected);

  const handleOnSelectNet = async (e) => {
    const index = e.detail;
    const net = keys[index];
    await selectNetwrok(net);
  };
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('netwrok.title')}/>
  <div>
    <MultiSwitcher
      items={Object.keys($netStore.config)}
      selected={selected}
      on:select={handleOnSelectNet}
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
