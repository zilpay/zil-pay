<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
	import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';

	import walletStore from 'popup/store/wallet';
	import contactsStore from 'popup/store/contacts';

  import SwitchButton from '../components/SwitchButton.svelte';
	import AccountCard from '../components/AccountCard.svelte';
	import SearchBox from '../components/SearchBox.svelte';
	import SearchBox from '../components/SearchBox.svelte';

  const dispatch = createEventDispatcher();

  let tab = false;
	let search = '';

	$: accounts = $walletStore.identities.filter(
		(acc) => String(acc.name).toLowerCase().includes(String(search).toLowerCase())
	);
  $: contacts = $contactsStore.filter(
		(contact) => String(contact.name).toLowerCase().includes(String(search).toLowerCase())
	);

	const onSelect = async (address) => {
		dispatch('selected', address);
	};
	const onInputSearch = (e) => {
		search = e.detail;
	};
</script>

<SearchBox
  placeholder={$_('accounts.placeholder')}
  focus
  on:input={onInputSearch}
/>
<div class="switcher">
  <SwitchButton
    items={[$_('send.options.acc'), $_('send.options.con')]}
    on:select={() => tab = !tab}
  />
</div>
{#if tab}
  <ul in:fly={flyTransition.in} >
    {#each contacts as contact}
      <li on:click={() => onSelect(contact.address)}>
				<div class="text">
					<b>
						{contact.name}
					</b>
					<p>
						{trim(contact.address, 10)}
					</p>
				</div>
			</li>
    {/each}
  </ul>
{:else}
  <ul in:fly={flyTransition.in} >
    {#each accounts as account}
      <li on:click={() => onSelect(account.bech32)}>
        <div class="text">
          <b>
            {account.name}
          </b>
          <p>
            {trim(account.bech32, 10)}
          </p>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style lang="scss">
	@import "../styles/mixins";
  div.switcher {
    margin: 10px;
  }
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;
    list-style: none;
		padding-block-end: 10px;
		padding-block-start: 10px;

		max-width: 390px;
		width: 100%;
    min-height: 600px;

		& > li {
			cursor: pointer;
			margin: 5px;
			background-color: var(--card-color);
			border-radius: 8px;
			border: solid 1px var(--card-color);

			padding-left: 30px;
			padding-right: 10px;
      padding-top: 10px;

			@include flex-between-row;

			&:hover {
				border: solid 1px var(--primary-color);
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
