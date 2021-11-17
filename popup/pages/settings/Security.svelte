<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';

	import NavClose from '../../components/NavClose.svelte';
	import Toggle from '../../components/Toggle.svelte';
  import Modal from '../../components/Modal.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';
  import RevealPhraseModal from '../../modals/RevealPhrase.svelte';

	let phishing = false;
	let phraseModal = false;
</script>

<Modal
  show={phraseModal}
  title={$_('security.p_modal.title')}
  on:close={() => phraseModal = !phraseModal}
>
	<RevealPhraseModal />
</Modal>
<main in:fly={flyTransition.in}>
	<NavClose title={$_('security.title')}/>
	<div>
		<Jumbotron
			title={$_('security.phrase.title')}
			description={$_('security.phrase.description')}
		>
			<button
				class="warning"
				on:click={() => phraseModal = !phraseModal}
			>
				{$_('security.phrase.btn')}
			</button>
		</Jumbotron>
		<Jumbotron
			title={$_('security.key.title')}
			description={$_('security.key.warn')}
		>
			<button class="warning">
				{$_('security.key.btn')}
			</button>
		</Jumbotron>
		<Jumbotron
			title={$_('security.phishing.title')}
			description={$_('security.phishing.warn')}
		>
			<Toggle
				checked={phishing}
				on:toggle={() => phishing = !phishing}
			/>
		</Jumbotron>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
