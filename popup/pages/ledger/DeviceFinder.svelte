<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  import BackBar from '../../components/BackBar.svelte';
  import ListCardSkelet from '../../components/skelet/ListCard.svelte';

  let loading = true;
  let devices = [];

  onMount(() => {});
</script>

<main>
  <BackBar
    length={2}
    selected={0}
  />
  <h1>
    {$_('ledger_finder.title')}
  </h1>
  {#if false}
    <p>
      {$_('ledger_finder.no_devices')}
    </p>
  {/if}
  <ul>
    {#if loading}
      <li>
        <ListCardSkelet />
      </li>
      <li>
        <ListCardSkelet />
      </li>
      <li>
        <ListCardSkelet />
      </li>
    {/if}
  </ul>
</main>

<style lang="scss">
	@import "../../styles/mixins";
  main {
		background-color: var(--background-color);
		height: 100vh;

    @include flex-center-top-column;
	}
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    overflow-y: scroll;
		margin-block-start: 16px;
		height: 100%;

    & > li {
			min-width: 290px;
      margin: 5px;
    }
  }
</style>
