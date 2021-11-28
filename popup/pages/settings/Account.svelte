<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { _ } from 'popup/i18n';

	import {
    MAX_NAME_LEN,
    MIN_NAME_LEN
  } from 'popup/config/account';

	import { getQrCOde, changeAccountName } from 'popup/backend/wallet';
  import { trim } from 'popup/filters/trim';
  import { clipboardCopy } from 'lib/utils/clipboard';

	import walletStore from 'popup/store/wallet';
	import format from 'popup/store/format';

	import NavClose from '../../components/NavClose.svelte';
	import Arrow from '../../components/icons/Arrow.svelte';
  import Modal from '../../components/Modal.svelte';
  import AccountsModal from '../../modals/Accounts.svelte';
	import SvgLoader from '../../components/SvgLoader.svelte';

	let accountsModal = false;
	let base58 = '';
	let index = $walletStore.selectedAddress;
	let name = $walletStore.identities[index].name;

	$: account = $walletStore.identities[index];

	onMount(async() => {
		base58 = await getQrCOde(index);
	});

	const onSelectAccount = async ({ detail }) => {
    index = detail;
		base58 = '';
		base58 = await getQrCOde(index);
    await tick();
    accountsModal = false;
	};
	const hanldeOnChangeName = async () => {
		if (name === account.name) {
			return;
		}
		await tick();
		await changeAccountName(index, name);
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
	<div>
		{#if base58}
			<img
				src={base58}
				alt="qrcode"
			/>
		{/if}
	</div>
	<label>
		<input
			bind:value={name}
			type="text"
			maxlength={MAX_NAME_LEN}
			minlength={MIN_NAME_LEN}
			placeholder={$_('setup_acc.name_placeholder')}
			on:blur={hanldeOnChangeName}
		/>
		<div>
			<SvgLoader
				src="/vectors/edit.svg"
			/>
		</div>
	</label>
	<button on:click={() => clipboardCopy(account[$format])}>
		{$_('home.clipboard.copy')}
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
			margin-block-start: 0.4em;
			margin-block-end: 0.2em;
		}
		& > div > p {
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
		width: 290px;
	}
</style>
