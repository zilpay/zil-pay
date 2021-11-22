<script lang="ts">
	import { onMount } from 'svelte';
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

	let tabs = [
		$_('confirm.tabs.tab_0'),
		$_('confirm.tabs.tab_1'),
		$_('confirm.tabs.tab_2'),
	];
	let selectedTab = 0;

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
	<main>
		<div class="border">
			<SelectCard
				header={account.name}
				text={trim(account[$format])}
				on:click={() => accountsModal = !accountsModal}
			>
				<div id={uuid}/>
			</SelectCard>
		</div>
		<div class="tabs">
			<ul>
				{#each tabs as tab, index}
					<li
						class:selected={selectedTab === index}
						on:click={() => selectedTab = index}
					>
						{tab}
					</li>
				{/each}
			</ul>
			<div class:bordered={selectedTab !== 0}>
				{#if selectedTab === 2}
					<h1>
						data
					</h1>
				{:else if  selectedTab === 1}
					<h1>
						gas
					</h1>
				{:else}
					<h1>
						params
					</h1>
				{/if}
			</div>
		</div>
	</main>
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 36px);

		@include flex-center-top-column;
	}
	div.border {
		background-color: var(--card-color);
		margin: 10px;
		min-width: 300px;

		@include border-radius(8px);
	}
	div.tabs {
		width: calc(100vw - 20px);
		max-width: 600px;

		& > div {
			background-color: var(--card-color);
			padding: 5px;

			@include border-bottom-radius(8px);
			@include border-right-radius(8px);

			&.bordered {
				@include border-radius(8px);
			}
		}
		& > ul {
			margin: 0;
			padding: 0;
			list-style: none;

			@include flex-left-horiz;

			& > li {
				cursor: pointer;
				padding: 10px;
				min-width: 80px;
				text-align: center;
				font-family: Demi;
				font-size: 16px;

				background-color: transparent;

				&.selected {
					background-color: var(--card-color);

					@include border-top-radius(8px);
				}
			}
		}
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
