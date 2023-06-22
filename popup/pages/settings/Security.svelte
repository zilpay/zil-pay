<script lang="ts">
	import { _ } from 'popup/i18n';

  import { AccountTypes } from 'config/account-type';

	import { setPhishingDetection } from 'popup/backend/settings';

	import walletStore from 'popup/store/wallet';
	import phishingStore from 'app/store/phishing';
	import guardStore from 'app/store/guard';

	import NavClose from '../../components/NavClose.svelte';
	import Toggle from '../../components/Toggle.svelte';
  import Modal from '../../components/Modal.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
  import RevealPhraseModal from '../../modals/RevealPhrase.svelte';
  import ExportKeyModal from '../../modals/ExportKey.svelte';
	import ConnectModal from '../../modals/Connect.svelte';
	import Guard from '../../components/Guard.svelte';

	import { MIN_PASSWORD_LEN } from 'config/guard';

	let phraseModal = false;
	let keyModal = false;
	let connectModal = false;
	let passError = '';
	let currentPassword = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let algorithm = $guardStore.algorithm;
	let iteractions = $guardStore.iteractions;

	$: disabled = loading || !password || confirmPassword !== password || Boolean(passError);
	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: keybtndisbaled = AccountTypes.Ledger === account.type;

	const hanldeOnTogglePhishingDetection = async () => {
		const enabled = $phishingStore;

		await setPhishingDetection(!enabled);
	};

	const hanldeChangeGuard = (e: CustomEvent) => {
    algorithm = e.detail.algorithm;
    iteractions = e.detail.iteractions;
  };
</script>

<Modal
  show={phraseModal}
  title={$_('security.p_modal.title')}
  on:close={() => phraseModal = !phraseModal}
>
	<RevealPhraseModal />
</Modal>
<Modal
  show={connectModal}
  title={$_('security.connect.title')}
  on:close={() => connectModal = !connectModal}
>
	<ConnectModal on:close={() => connectModal = false}/>
</Modal>
<Modal
  show={keyModal}
  title={$_('security.key.title')}
  on:close={() => keyModal = !keyModal}
>
	<ExportKeyModal />
</Modal>
<main>
	<NavClose title={$_('security.title')}/>
	<div>
		<Jumbotron
			title={$_('security.phrase.title')}
			description={$_('security.phrase.description')}
		>
			<span
				class="warning"
				on:mouseup={() => phraseModal = !phraseModal}
			>
				{$_('security.phrase.btn')}
			</span>
		</Jumbotron>
		{#if !keybtndisbaled}
			<Jumbotron
				title={$_('security.key.title')}
				description={$_('security.key.warn')}
			>
				<span
					class="warning"
					class:disabled={account.type === AccountTypes.Track}
					on:mouseup={() => keyModal = !keyModal && account.type !== AccountTypes.Track}
				>
					{$_('security.key.btn')}
				</span>
			</Jumbotron>
		{/if}
		<Jumbotron
			title={$_('security.connect.title')}
			description={$_('security.connect.warn')}
		>
			<span
				class="warning"
				on:mouseup={() => connectModal = !connectModal}
			>
				{$_('security.connect.btn')}
			</span>
		</Jumbotron>
		<Jumbotron
			title={$_('security.phishing.title')}
			description={$_('security.phishing.warn')}
		>
			<div class="right">
				<Toggle
					checked={$phishingStore}
					on:toggle={hanldeOnTogglePhishingDetection}
				/>
			</div>
		</Jumbotron>
		<Jumbotron
			title={$_('security.password.title')}
			description={$_('security.password.description')}
		>
			<form on:submit={() => null}>
				<b>
					{passError}
				</b>
				<label class="current-pass">
					<input
						bind:value={currentPassword}
						class:error="{Boolean(passError)}"
						type="password"
						class:loading={loading}
						autocomplete="off"
						disabled={loading}
						placeholder={$_('security.password.current')}
						required
						on:input={() => passError = ''}
					>
				</label>
				<label>
					<input
						bind:value={password}
						class:error="{Boolean(passError)}"
						type="password"
						class:loading={loading}
						autocomplete="off"
						disabled={loading}
						placeholder={$_('security.password.new')}
						minlength={MIN_PASSWORD_LEN}
						required
						on:input={() => passError = ''}
					>
				</label>
				<input
					bind:value={confirmPassword}
					class:error="{Boolean(passError)}"
					type="password"
					class:loading={loading}
					autocomplete="off"
					disabled={loading}
					placeholder={$_('restore.conf_placeholder')}
					minlength={MIN_PASSWORD_LEN}
					required
					on:input={() => passError = ''}
				>
				<Guard
					algorithm={algorithm}
					iteractions={iteractions}
					on:input={hanldeChangeGuard}
				/>
				<button
					class="outline"
					class:loading={loading}
					disabled={disabled}
				>
					{$_('restore.btn')}
				</button>
			</form>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@import "../../styles";

	main {
		height: 100vh;
		background-color: var(--background-color);
    overflow-y: scroll;

		@include flex-center-top-column;
	}
	form {
		@include flex-center-top-column;

		& > label, input, button {
			width: 100%;
			max-width: 290px;
		}
		& > label > input,
		& > input {
			background-color: var(--button-color);
		}
		& > button {
			margin-block-end: 16px;
		}
		& > input {
			margin: 5px;
		}
		& > b {
			color: var(--danger-color);
		}
		& > label.current-pass {
			margin: 16px;
		}
	}
	span {
		font-family: Demi;

		&.disabled {
			cursor: unset !important;
			opacity: 0.5;
		}
		&.warning {
			cursor: pointer;
			font-size: 16px;
			color: var(--primary-color);

			&:hover {
				color: var(--warning-color);
			}
		}
	}
</style>
