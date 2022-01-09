<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';

  import { AccountTypes } from 'config/account-type';

	import { setPhishingDetection } from 'popup/backend/settings';

	import walletStore from 'popup/store/wallet';
	import phishingStore from 'app/store/phishing';

	import NavClose from '../../components/NavClose.svelte';
	import Toggle from '../../components/Toggle.svelte';
  import Modal from '../../components/Modal.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
  import RevealPhraseModal from '../../modals/RevealPhrase.svelte';
  import ExportKeyModal from '../../modals/ExportKey.svelte';
	import ConnectModal from '../../modals/Connect.svelte';

	let phraseModal = false;
	let keyModal = false;
	let connectModal = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: keybtndisbaled = AccountTypes.Ledger === account.type;

	const hanldeOnTogglePhishingDetection = async () => {
		const enabled = $phishingStore;

		await setPhishingDetection(!enabled);
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
				on:click={() => phraseModal = !phraseModal}
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
					on:click={() => keyModal = !keyModal}
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
				on:click={() => connectModal = !connectModal}
			>
				{$_('security.connect.btn')}
			</span>
		</Jumbotron>
		<Jumbotron
			title={$_('security.phishing.title')}
			description={$_('security.phishing.warn')}
		>
			<Toggle
				checked={$phishingStore}
				on:toggle={hanldeOnTogglePhishingDetection}
			/>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
    overflow-y: scroll;

		@include flex-center-top-column;
	}
	span {
		font-family: Demi;
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
