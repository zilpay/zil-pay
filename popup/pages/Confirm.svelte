<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { push } from 'svelte-spa-router';
	import { fade } from "svelte/transition";

  import { uuidv4 } from 'lib/crypto/uuid';
  import { trim } from 'popup/filters/trim';
	import { jazziconCreate } from 'popup/mixins/jazzicon';
	import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
	import { rejectForSignTx } from 'popup/backend/sign';
  import { formatNumber } from 'popup/filters/n-format';

	import format from 'popup/store/format';
	import walletStore from 'popup/store/wallet';
	import transactionsStore from 'popup/store/transactions';
	import gasStore from 'popup/store/gas';

	import TopBar from '../components/TopBar.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
	import AccountsModal from '../modals/Accounts.svelte';
	import Params from '../components/confirm/Params.svelte';
	import GasControl from '../components/GasControl.svelte';

	export let params = {
    index: 0
  };

	let uuid = uuidv4();
	let accountsModal = false;
	let accountIndex = params.index || $walletStore.selectedAddress;
	let gasMultiplier = $gasStore.multiplier;
	let tx = $transactionsStore.forConfirm[$transactionsStore.forConfirm.length - 1];

	let tabs = [
		$_('confirm.tabs.tab_0'),
		$_('confirm.tabs.tab_1'),
		$_('confirm.tabs.tab_2'),
	];
	let selectedTab = 0;

	$: list = $transactionsStore.forConfirm;
	$: account = $walletStore.identities[accountIndex];

	onMount(() => {
		console.log(tx);
		jazziconCreate(uuid, account.base16);
  });
	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
		jazziconCreate(uuid, account.base16);
	};
	const handleOnChangeGasMultiplier = async ({ detail }) => {
		gasMultiplier = detail;
		tx.gasPrice = tx.gasPrice * gasMultiplier;
		tx.fee = (tx.gasPrice * tx.gasLimit) / 1000000;
	};

	const handleOnReject = async () => {
		const isExtends = Boolean(tx.uuid);
		try {
			await rejectForSignTx(list.length - 1);
		} catch {
			////
		}

		if (list.length === 0) {
			if (isExtends) {
				window.close();
			}

			push('/');
		}

		tx = $transactionsStore.forConfirm[$transactionsStore.forConfirm.length - 1];
	};
	const handleOnConfirm = () => {};
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
		<hr/>
		{#if tx}
			<div
				class="header"
				in:fade
			>
				<h1>
					{tx.title}
				</h1>
				<img
					src={tx.icon}
					alt="logo"
					width="55px"
					height="55px"
				/>
			</div>
		{/if}
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
				{#if selectedTab === 2 && tx}
					<ul>
						<li>
							<span>
								{$_('confirm.params.amount')}
							</span>
							<span>
								sadasdsa
							</span>
						</li>
					</ul>
				{:else if  selectedTab === 1 && tx}
					<div in:fade>
						<GasControl
							multiplier={gasMultiplier}
							gasLimit={tx.gasLimit}
							on:select={handleOnChangeGasMultiplier}
						/>
					</div>
				{:else if  selectedTab === 0 && tx}
					<Params tx={tx}/>
				{/if}
			</div>
		</div>
		<br />
		<hr />
		<div class="btns">
			<button
				class="primary"
				on:click={handleOnConfirm}
			>
				{$_('confirm.btns.confirm')}
			</button>
			<button on:click={handleOnReject}>
				{$_('confirm.btns.reject')}
			</button>
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
	.header {
		margin-block-end: 16px;
		text-align: center;
	}
	.btns {
		@include flex-between-row;

		& > button {
			margin: 10px;
			min-width: 140px;
		}
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
