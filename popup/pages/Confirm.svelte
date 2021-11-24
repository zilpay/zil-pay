<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { push } from 'svelte-spa-router';
	import { fade } from "svelte/transition";

	import { QA } from 'popup/config/gas';

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
	import EditParamsModal from '../modals/EditParams.svelte';
	import Params from '../components/confirm/Params.svelte';
	import GasControl from '../components/GasControl.svelte';

	export let params = {
    index: 0
  };

	let uuid = uuidv4();
	let accountsModal = false;
	let editModal = false;

	let accountIndex = params.index || $walletStore.selectedAddress;
	let gasMultiplier = $gasStore.multiplier;
	let tx = $transactionsStore.forConfirm[$transactionsStore.forConfirm.length - 1];
	let startGasPrice = Number(tx.gasPrice);

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

	const onGasChanged = () => {
		tx.fee = (tx.gasPrice * tx.gasLimit) / QA;
	};

	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
		jazziconCreate(uuid, account.base16);
	};
	const handleOnChangeGasMultiplier = async ({ detail }) => {
		gasMultiplier = detail;
		tx.gasPrice = startGasPrice * gasMultiplier;
		onGasChanged();
	};
	const hanldeOnUpdateParams = ({ detail }) => {
		editModal = !editModal;
		const { gasLimit, gasPrice, nonce } = detail;

		tx.gasLimit = Math.abs(gasLimit);
		tx.gasPrice = Math.abs(gasPrice);
		tx.nonce = Math.abs(nonce);

		tx = {
			...tx,
			gasLimit,
			gasPrice,
			nonce
		};
		onGasChanged();
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
		startGasPrice = Number(tx.gasPrice);
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
<Modal
  show={editModal}
  title={$_('confirm.parmas_modal.title')}
  on:close={() => editModal = !editModal}
>
	<EditParamsModal
		tx={tx}
		on:update={hanldeOnUpdateParams}
	/>
</Modal>
<section>
	<TopBar expand={false}/>
	<main>
		<div>
			<SelectCard
				header={account.name}
				text={trim(account[$format])}
				on:click={() => accountsModal = !accountsModal}
			>
				<div id={uuid}/>
			</SelectCard>
			<hr/>
		</div>
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
		<div class="params">
			<GasControl
				multiplier={gasMultiplier}
				gasLimit={tx.gasLimit}
				gasPrice={startGasPrice}
				on:select={handleOnChangeGasMultiplier}
			/>
			<h3 on:click={() => editModal = !editModal}>
				(Edit)
			</h3>
			<Params tx={tx}/>
		</div>
		<!-- <hr/> -->
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
		max-height: 600px;
    overflow-y: scroll;

		@include flex-center-column;
		justify-content: space-between;
	}
	.header {
		margin-block-end: 16px;
		text-align: center;

		& > h1 {
			margin: 0;
			line-height: 38px;

			@include fluid-font(320px, 720px, 20px, 30px);
			@include text-shorten;
		}
	}
	.btns {
		@include flex-between-row;

		& > button {
			margin: 10px;
			min-width: 140px;
		}
	}
	div.params {
		box-shadow:
			rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
			rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;

		background-color: var(--card-color);
		@include border-radius(8px);

		& > h3 {
			cursor: pointer;
			text-align: right;
			margin-right: 16px;
			color: var(--warning-color);
			margin-block-end: 0;
		}
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
