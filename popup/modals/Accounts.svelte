<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
	import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';

	import AccountCard from '../components/AccountCard.svelte';
	import SearchBox from '../components/SearchBox.svelte';

  const dispatch = createEventDispatcher();

  export let list = [];
  export let index = 0;

	let search = '';

	$: identities = list.filter(
		(acc) => String(acc.name).toLowerCase().includes(String(search).toLowerCase())
	);
	$: selectedAccount = list[index];

	const onSelectAccount = async (account) => {
		const index = list.findIndex(
			(a) => a.base16 === account.base16
		);
		dispatch('selected', index);
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
{#if identities.length === 0}
	<p>
		{$_('accounts.no_accounts')} {search}
	</p>
{/if}
<ul>
	{#each identities as account, index}
		<li
			in:fly={{
				delay: 50 * index,
				duration: 400,
				y: -20
			}}
			on:mouseup={() => onSelectAccount(account)}
		>
			<AccountCard
				account={account}
				selected={account.base16 === selectedAccount.base16}
			/>
		</li>
	{/each}
</ul>

<style lang="scss">
	@import "../styles";
	ul {
		padding: 0;
    margin: 0;
		margin-block-start: 16px;
    overflow-y: scroll;
		padding-block-end: 70px;

		width: 100%;
    min-height: 530px;
		max-width: 640px;

		& > li {
			cursor: pointer;
			margin: 10px;
			background-color: var(--card-color);
			border: solid 1px var(--card-color);

			padding-left: 10px;
			padding-right: 10px;

			@include flex-between-row;
			@include border-radius($default-border-radius);

			&:hover {
				border: solid 1px var(--primary-color);
			}
		}
	}
</style>
