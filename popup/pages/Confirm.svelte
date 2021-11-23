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

	import TopBar from '../components/TopBar.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import Modal from '../components/Modal.svelte';
	import AccountsModal from '../modals/Accounts.svelte';

	export let params = {
    index: 0
  };

	let uuid = uuidv4();
	let accountsModal = false;
	let accountIndex = params.index || $walletStore.selectedAddress;

	let tabs = [
		$_('confirm.tabs.tab_0'),
		$_('confirm.tabs.tab_1'),
		$_('confirm.tabs.tab_2'),
	];
	let selectedTab = 0;

	$: list = $transactionsStore.forConfirm;
	$: account = $walletStore.identities[accountIndex];
	$: tx = list[list.length - 1];

	$: amount = fromDecimals(tx.amount, tx.token.decimals).round(7);

	onMount(() => {
		console.log(tx);
		jazziconCreate(uuid, account.base16);
  });
	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
		jazziconCreate(uuid, account.base16);
	};
	const handleOnReject = async () => {
		try {
			await rejectForSignTx(list.length - 1);
		} catch {
			////
		}

		if (list.length === 0) {
			window.close();
		}
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
		<div class="header">
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
				{:else if  selectedTab === 1}
					<h1 in:fade>
						gas
					</h1>
				{:else}
					<ul
						in:fade
						class="params"
					>
						<li>
							<span>
								{$_('confirm.params.amount')}
							</span>
							<span>
								{formatNumber(amount)} {tx.token.symbol} + {tx.fee} ZIL
							</span>
						</li>
						<li>
							<span>
								{$_('confirm.params.teg')}
							</span>
							<span>
								{tx.teg}
							</span>
						</li>
						<li>
							<span>
								{$_('confirm.params.fee')}
							</span>
							<span>
								{tx.fee} ZIL
							</span>
						</li>
						<li>
							<span>
								{$_('confirm.params.nonce')}
							</span>
							<span>
								{tx.nonce || 0}
							</span>
						</li>
						<li>
							<span>
								{$_('confirm.params.to')}
							</span>
							<span>
								{trim(tx.toAddr)}
							</span>
						</li>
					</ul>
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
	ul.params {
		margin: 0;
    padding: 0;
    list-style: none;

		& > li {
			line-height: 20px;
			padding: 5px;
			font-family: Regular;
			font-size: 16px;
			border-bottom: solid 1px var(--border-color);
			color: var(--text-color);

			@include flex-between-row;

			&:last-child {
				border-bottom: solid 1px transparent;
			}
			& > span:last-child {
				font-family: Demi;
			}
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
