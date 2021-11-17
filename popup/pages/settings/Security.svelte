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
  import RevealPhraseModal from '../../modals/RevealPhrase.svelte';

	let phishing = false;
	let phraseModal = false;
</script>

<Modal
  show={phraseModal}
  title={$_('security.p_modal.title')}
  on:close={() => phraseModal = !phraseModal}
>
  <div class="m-warp">
    <RevealPhraseModal
      on:close={() => phraseModal = !phraseModal}
    />
  </div>
</Modal>
<main in:fly={flyTransition.in}>
	<NavClose title={$_('security.title')}/>
	<div>
		<div class="card">
			<h3>
				{$_('security.phrase.title')}
			</h3>
			<p>
				{$_('security.phrase.description')}
			</p>
			<button
				class="warning"
				on:click={() => phraseModal = !phraseModal}
			>
				{$_('security.phrase.btn')}
			</button>
		</div>
		<div class="card">
			<h3>
				{$_('security.key.title')}
			</h3>
			<p>
				{$_('security.key.warn')}
			</p>
			<button class="warning">
				{$_('security.key.btn')}
			</button>
		</div>
		<div class="card">
			<h3>
				{$_('security.phishing.title')}
			</h3>
			<p>
				{$_('security.phishing.warn')}
			</p>
			<Toggle
				checked={phishing}
				on:toggle={() => phishing = !phishing}
			/>
		</div>
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	.card {
		background-color: var(--card-color);

    width: 100%;
    min-width: 290px;
    max-width: 500px;
    padding: 16px;
		margin-block-end: 16px;

		& > h3 {
			margin: 0;
		}

		@media screen and (min-width: 400px) {
			@include border-radius(8px);
    }
	}
</style>
