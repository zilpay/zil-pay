<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { push } from 'svelte-spa-router';
	import { fade } from "svelte/transition";

	import { QA } from 'popup/config/gas';

  import { uuidv4 } from 'lib/crypto/uuid';
	import { closePopup } from 'popup/mixins/popup';
  import { trim } from 'popup/filters/trim';
	import { jazziconCreate } from 'popup/mixins/jazzicon';
	import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
	import {
		rejectForSignTx,
		sendTransactionToSign,
		getTxRequiredParams
	} from 'popup/backend/sign';
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
	let error = '';
	let loading = true;

	let accountIndex = params.index || $walletStore.selectedAddress;
	let gasMultiplier = $gasStore.multiplier;
	let tx = $transactionsStore.forConfirm[$transactionsStore.forConfirm.length - 1];
	let startGasPrice = Number(tx.gasPrice);

	$: list = $transactionsStore.forConfirm;
	$: account = $walletStore.identities[accountIndex];
	$: txIndex = $transactionsStore.forConfirm.length - 1;

	const onUpdateParams = async () => {
		error = '';
		loading = true;

		try {
			const params = await getTxRequiredParams(accountIndex);
			tx.version = params.version;
			tx.nonce = tx.cancel ? tx.nonce : params.nonce;
			startGasPrice = params.minGasPrice;
		} catch (err) {
			error = err.message;
		}
		loading = false;
	};
	const onNextTx = async () => {
		const isExtends = Boolean(tx.uuid);
		if (list.length === 0) {
			if (isExtends) {
				await closePopup();
			}

			push('/history');
		} else {
			tx = $transactionsStore.forConfirm[txIndex];
			startGasPrice = Number(tx.gasPrice);

			await onUpdateParams();
		}
	};

	onMount(async() => {
		jazziconCreate(uuid, account.base16);
		await onUpdateParams();
  });

	const onGasChanged = () => {
		tx.fee = (tx.gasPrice * tx.gasLimit) / QA;
	};

	const onSelectAccount = async ({ detail }) => {
    accountIndex = detail;
    accountsModal = false;
		jazziconCreate(uuid, account.base16);

		await onUpdateParams();
	};
	const handleOnChangeGasMultiplier = async ({ detail }) => {
		gasMultiplier = detail;
		tx.gasPrice = startGasPrice * gasMultiplier;
		onGasChanged();
	};
	const hanldeOnUpdateParams = ({ detail }) => {
		editModal = !editModal;
		error = '';
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
		error = '';
		try {
			await rejectForSignTx(list.length - 1);
		} catch {
			////
		}

		await onNextTx();
	};
	const handleOnConfirm = async () => {
		loading = true;
		error = '';
		try {
			await sendTransactionToSign(txIndex, accountIndex, tx);
			await onNextTx();
		} catch (err) {
			error = err.message;
		}
		loading = false;
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
	<TopBar
		expand={false}
		refresh
		on:refresh={onUpdateParams}
	/>
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
					width="30px"
					height="30px"
				/>
				<h2>
					{error}
				</h2>
			</div>
		{/if}
		<div
			class="params"
			class:loading={loading}
		>
			<GasControl
				multiplier={gasMultiplier}
				gasLimit={tx.gasLimit}
				gasPrice={startGasPrice}
				on:select={handleOnChangeGasMultiplier}
			/>
			{#if !tx.cancel}
				<h3 on:click={() => editModal = !editModal}>
					({$_('confirm.edit')})
				</h3>
			{/if}
			<Params tx={tx} />
		</div>
		<div class="btns">
			<button on:click={handleOnReject}>
				{$_('confirm.btns.reject')}
			</button>
			<button
				class="primary"
				class:loading={loading}
				disabled={loading}
				on:click={handleOnConfirm}
			>
				{$_('confirm.btns.confirm')}
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
		text-align: center;

		@include flex-center-column;

		& > h1 {
			margin: 0;
			line-height: 30px;

			max-width: 300px;

			@include fluid-font(320px, 720px, 20px, 30px);
			@include text-shorten;
		}
		& > h2 {
			color: var(--danger-color);
			width: calc(100vw - 16px);
			margin: 0;
			@include fluid-font(320px, 720px, 14px, 20px);
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

		&.loading {
      @include loading-gradient(var(--background-color), var(--card-color));
    }
		& > h3 {
			cursor: pointer;
			text-align: right;
			margin-right: 16px;
			color: var(--warning-color);
			margin-block-end: 0;
			font-size: 15px;
		}
	}
	section {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
</style>
