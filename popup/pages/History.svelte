<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
  import { checkProcessedTx } from 'popup/backend/transactions';

  import transactionsStore from 'popup/store/transactions';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import Transaction from '../components/Transaction.svelte';
  import Modal from '../components/Modal.svelte';
  import TransactionModal from '../modals/Transaction.svelte';

  let loading = false;
  let showTx = null;

  $: history = $transactionsStore.transactions.filter((t) => t.confirmed);
  $: queue = $transactionsStore.transactions.filter((t) => !t.confirmed);

  const hanldeOnUpdate = async () => {
    loading = true;
    try {
      await checkProcessedTx();l
    } catch {
      ////
    }
    loading = false;
  };
</script>

<Modal
  show={Boolean(showTx)}
  title={$_('history.modals.details.title')}
  on:close={() => showTx = null}
>
  {#if showTx}
    <TransactionModal />
  {/if}
</Modal>
<section>
	<TopBar
    refresh
    on:refresh={hanldeOnUpdate}
  />
	<main>
    <h2>
      {$_('history.title')}
    </h2>
    {#if history.length === 0 && queue.length === 0}
      <p>
        {$_('history.no_txns')}
      </p>
    {/if}
    <div class="list">
      {#if queue.length > 0}
        <b>
          {$_('history.queue')} ({queue.length})
        </b>
        <ul>
          {#each queue as tx}
            <li on:click={() => showTx = tx}>
              <Transaction
                tx={tx}
                loading={loading}
              />
            </li>
          {/each}
        </ul>
      {/if}
      {#if history.length > 0}
        <b>
          {$_('history.history')} ({history.length})
        </b>
        <ul>
          {#each history as tx}
            <li on:click={() => showTx = tx}>
              <Transaction tx={tx}/>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
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

    & > b {
      width: 100%;
    }
	}
  div.list {
    overflow-y: scroll;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    & > li {
      margin: 10px;
    }
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
