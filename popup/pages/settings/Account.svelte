<script lang="ts">
	import {
    MAX_NAME_LEN,
    MIN_NAME_LEN
  } from 'popup/config/account';

	import { onMount, tick } from 'svelte';
  import { fade, blur } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { getCurrentNonce, resetNonce } from 'popup/backend/transactions';
	import { getQrCOde, changeAccountName, selectAccount } from 'popup/backend/wallet';

  import { trim } from 'popup/filters/trim';

	import walletStore from 'popup/store/wallet';
	import format from 'popup/store/format';
	import transactionsStore from 'popup/store/transactions';

	import NavClose from '../../components/NavClose.svelte';
	import Arrow from '../../components/icons/Arrow.svelte';
  import Modal from '../../components/Modal.svelte';
  import AccountsModal from '../../modals/Accounts.svelte';
	import EditIcon from '../../components/icons/Edit.svelte';

	let accountsModal = false;
	let base58 = '';
	let index = $walletStore.selectedAddress;
	let name = $walletStore.identities[index].name;
	let nonce = 0;
	let loading = true;

	$: account = $walletStore.identities[index];

	async function updateState() {
		loading = true;
		base58 = '';
		try {
			base58 = await getQrCOde(index);
			nonce = await getCurrentNonce();
		} catch {
			///
		}
		loading = false;
	}

	onMount(async() => {
		await updateState();
	});

	const onSelectAccount = async ({ detail }) => {
    index = detail;
    accountsModal = false;
    await tick();
		await selectAccount(detail);
		await updateState();
	};
	const hanldeOnChangeName = async () => {
		if (name === account.name) {
			return;
		}
		await tick();
		await changeAccountName(index, name);
	};
	const handleOnResetNonce = async () => {
		loading = true;
		try {
			nonce = await resetNonce();
		} catch {
			///
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
      index={index}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<main>
	<NavClose title={$_('account.title')}/>
	<div
		class="card"
		in:fade
		on:click={() => accountsModal = !accountsModal}
	>
		<div>
			<h3>
				{account.name}
			</h3>
			<p>
				{trim(account[$format])}
			</p>
		</div>
		<span>
			<Arrow />
		</span>
	</div>
	<div in:blur>
		{#if base58}
			<img
				src={base58}
				width="300"
				alt="qrcode"
			/>
		{/if}
	</div>
	<label in:fade>
		<input
			bind:value={name}
			type="text"
			maxlength={MAX_NAME_LEN}
			minlength={MIN_NAME_LEN}
			placeholder={$_('setup_acc.name_placeholder')}
			on:blur={hanldeOnChangeName}
		/>
		<div>
			<EditIcon />
		</div>
	</label>
	<button
		class:loading={loading}
		disabled={loading}
		on:click={handleOnResetNonce}
	>
		{$_('account.reset')} #{nonce}
	</button>
</main>

<style lang="scss">
	@import "../../styles/mixins";
	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	img {
		max-width: 500px;
		width: calc(100vw - 50px);
	}
	label {
		background-color: var(--card-color);
		min-width: 270px;
		max-width: 300px;
		border: solid 1px transparent;

		margin-block-start: 15px;
		margin-block-end: 10px;

		@include border-radius(8px);
		@include flex-between-row;

		& > div {
			margin-right: 10px;
		}
		& > input {
			border: none;
		}
		&:focus-within {
      border: solid 1px var(--text-color);
    }
	}
	div.card {
		cursor: pointer;
		min-width: 270px;

		text-indent: 10px;

		margin: 16px;
		padding: 5px;
		background-color: var(--card-color);
		border: solid 1px var(--card-color);

		@include border-radius(8px);
		@include flex-between-row;

		&:hover {
			border-color: var(--primary-color);
		}

		& > div > h3 {
			font-size: 10pt;
			margin-block-start: 0.4em;
			margin-block-end: 0.2em;
		}
		& > div > p {
			font-size: 9pt;
			margin-block-start: 0em;
			margin-block-end: 0.4em;
		}
		& > span {
			width: 50px;
			height: 40px;
			transform: rotate(90deg);
		}
	}
	button {
		min-width: 270px;
		max-width: 300px;
	}
</style>
