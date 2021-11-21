<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';

  import { uuidv4 } from 'lib/crypto/uuid';
  import { trim } from 'popup/filters/trim';
	import { jazziconCreate } from 'popup/mixins/jazzicon';

	import format from 'popup/store/format';
	import walletStore from 'popup/store/wallet';

	import TopBar from '../components/TopBar.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
	import AccountsModal from '../modals/Accounts.svelte';

	export let params = {
    index: 0
  };

	let accountsModal = false;
	let accountIndex = params.index;

	$: account = $walletStore.identities[accountIndex];

  const uuid = uuidv4();

	onMount(() => {
		jazziconCreate(uuid, account.base16);
  });
	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
	};
</script>

<Modal
  show={accountsModal}
  title={$_('send.cards.token')}
  on:close={() => accountsModal = !accountsModal}
>
  <div class="m-warp">
    <AccountsModal
      list={$walletStore.identities}
      index={accountIndex}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<section>
	<TopBar expand={false}/>
	<main in:scale>
		<SelectCard
			title={$_('send.cards.transfer')}
			header={account.name}
			text={trim(account[$format])}
			on:click={() => accountsModal = !accountsModal}
		>
			<div id={uuid}/>
		</SelectCard>
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
