<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';

  import transactionsStore from 'popup/store/transactions';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';

  $: transactions = $transactionsStore.transactions;
</script>

<section>
	<TopBar refresh/>
	<main>
    <h2>
      {$_('history.title')}
    </h2>
    {#if transactions.length === 0}
      <p>
        {$_('history.no_txns')}
      </p>
    {/if}
    <ul>
      {#each transactions as transaction}
        <li>
          {transaction.hash}
        </li>
      {/each}
    </ul>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 86px);
    max-width: 500px;
    width: calc(100vw - 15px);
		@include flex-center-top-column;
	}
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
  h2 {
    text-align: left;
    width: 100%;
    margin-block-end: 0;
    @include fluid-font(320px, 720px, 20px, 30px);
  }
  p {
    text-indent: 15px;
    @include fluid-font(320px, 720px, 15px, 20px);
  }
</style>
