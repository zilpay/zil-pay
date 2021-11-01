<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';

  import SwitchButton from '../components/SwitchButton.svelte';

  let numbers = 128;

  const hanldeSelectNumber = (e) => {
    const value = e.detail;

    numbers = value ? 256 : 128;
  };
</script>

<main
in:fly={flyTransition.in}
out:fly={flyTransition.out}
>
  <h1>
    {$_('create.title')}
  </h1>
  <h3>
    {$_('create.sub_title')}
  </h3>
  <SwitchButton
    items={['12', '24']}
    on:select={hanldeSelectNumber}
  />
</main>

<style type="text/scss">
	@import "../styles/mixins";
  h1, h3 {
    color: var(--text-color);
  }
  main {
		background-color: var(--background-color);
		height: 100vh;

    @include flex-center-top-column;
	}
</style>
