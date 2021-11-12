<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';

	import NavClose from '../../components/NavClose.svelte';
	import SearchBox from '../../components/SearchBox.svelte';
  import Modal from '../../components/Modal.svelte';
  import AddContactModal from '../../modals/AddContact.svelte';

	let search = '';
	let addContact = false;

	const onInputSearch = (e) => {
		search = e.detail;
	};
</script>

<Modal
  show={addContact}
  title={$_('contacts.new_contact')}
  on:close={() => addContact = !addContact}
>
	<AddContactModal />
</Modal>
<main in:fly={flyTransition.in}>
	<NavClose title={$_('contacts.title')}/>
	<SearchBox
		placeholder={$_('accounts.placeholder')}
		focus
		on:input={onInputSearch}
	/>
	<ul>
		<li></li>
	</ul>
	<button
		class="primary"
		on:click={() => addContact = !addContact}
	>
		{$_('contacts.add_btn')}
	</button>
</main>

<style lang="scss">
	@import "../../styles/mixins";
	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	button {
		width: 290px;
	}
</style>
