<script lang="ts">
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
	import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';

	import { selectAccount, balanceUpdate } from 'popup/backend/wallet';

	import NavClose from '../components/NavClose.svelte';
	import AccountCard from '../components/AccountCard.svelte';
	import SearchBox from '../components/SearchBox.svelte';

	let search = '';

	$: identities = $walletStore.identities.filter(
		(acc) => String(acc.name).toLowerCase().includes(String(search).toLowerCase())
	);
	$: selectedAccount = $walletStore.identities[$walletStore.selectedAddress];

	const onSelectAccount = async (account) => {
		const index = $walletStore.identities.findIndex(
			(a) => a.base16 === account.base16
		);
		await selectAccount(index);
		balanceUpdate();
		push('/');
	};
	const onInputSearch = (e) => {
		search = e.detail;
	};
</script>

<main>
	<NavClose title={$_('accounts.title')}/>
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
	<ul in:fly={flyTransition.in} >
		{#each identities as account, index}
			<li on:click={() => onSelectAccount(account)}>
				<AccountCard
					account={account}
					selected={account.base16 === selectedAccount.base16}
				/>
			</li>
		{/each}
	</ul>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;
    list-style: none;
		padding-top: 10px;

		max-width: 390px;
		width: 100%;
		height: calc(100vh - 97px);

		& > li {
			cursor: pointer;
			margin: 10px;
			background-color: var(--card-color);
			border-radius: 8px;
			border: solid 1px var(--card-color);

			padding-left: 10px;
			padding-right: 10px;

			@include flex-between-row;

			&:hover {
				border: solid 1px var(--primary-color);
			}
		}
	}
</style>
