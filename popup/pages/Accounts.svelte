<script lang="ts">
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
	import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';

	import { selectAccount } from 'popup/backend/wallet';

	import NavClose from '../components/NavClose.svelte';
	import AccountCard from '../components/AccountCard.svelte';

	const onSelectAccount = async (index: number) => {
		await selectAccount(index);
		push('/');
	};
</script>

<main>
	<NavClose title={$_('accounts.title')}/>
	<ul
		in:fly={flyTransition.in}
		out:fly={flyTransition.out}
	>
		{#each $walletStore.identities as account, index}
			<li on:click={() => onSelectAccount(index)}>
				<AccountCard
					account={account}
					selected={index === $walletStore.selectedAddress}
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

		max-width: 390px;
		width: calc(100vw - 15px);
		height: calc(100vh - 97px);

		& > li {
			cursor: pointer;
			background-color: var(--card-color);
			border-radius: 8px;
			border: solid 1px var(--card-color);

			padding-left: 20px;
			padding-right: 20px;

			@include flex-between-row;

			&:hover {
				border: solid 1px var(--primary-color);
			}
		}
	}
</style>
