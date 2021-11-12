<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';

	import { jazziconCreate } from 'popup/mixins/jazzicon';
  import { trim } from 'popup/filters/trim';

	import contactsStore from 'popup/store/contacts';

	import NavClose from '../../components/NavClose.svelte';
	import SearchBox from '../../components/SearchBox.svelte';
  import Modal from '../../components/Modal.svelte';
  import AddContactModal from '../../modals/AddContact.svelte';
	import DropDown from '../../components/DropDown.svelte';

	let search = '';
	let addContact = false;

	$: contacts = $contactsStore.filter(
		(contact) => String(contact.name).toLowerCase().includes(String(search).toLowerCase())
	);

	const onInputSearch = (e) => {
		search = e.detail;
	};
</script>

<Modal
  show={addContact}
  title={$_('contacts.new_contact')}
  on:close={() => addContact = !addContact}
>
	<AddContactModal
		on:close={() => addContact = false}
	/>
</Modal>
<main in:fly={flyTransition.in}>
	<NavClose title={$_('contacts.title')}/>
	<SearchBox
		placeholder={$_('accounts.placeholder')}
		focus
		on:input={onInputSearch}
	/>
	<ul>
		{#each contacts as contact, index}
			<li class:border={index !== $contactsStore.length - 1}>
				<div class="text">
					<b>
						{contact.name}
					</b>
					<p>
						{trim(contact.address)}
					</p>
				</div>
				<DropDown />
			</li>
		{/each}
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
		margin-block-end: 30px;
		margin-block-start: 30px;
	}
	ul {
		padding: 0;
    margin: 0;
    list-style: none;
    overflow-y: scroll;
		margin-block-start: 16px;
		height: 100%;

		& > li {
			min-width: 280px;
			max-width: 380px;
			margin: 10px;
			text-indent: 10px;
			@include flex-between-row;
			&.border {
				border-bottom: solid 1px var(--muted-color);
			}
			& > div {
				cursor: pointer;
			}
			& > div.text {
				width: 100%;
				& > b {
					font-size: 16px;
					color: var(--text-color);
					font-family: Bold;
				}
				& > p {
					font-size: 13px;
				}
			}
		}
	}
</style>
