<script lang="ts">
	import { push } from "svelte-spa-router";
	import { _ } from "popup/i18n";
	import walletStore from "popup/store/wallet";
	import { fade } from "svelte/transition";

	import { selectAccount } from "popup/backend/wallet";

	import NavClose from "../components/NavClose.svelte";
	import AccountsModal from "../modals/Accounts.svelte";

	const onSelectAccount = async ({ detail }) => {
		await selectAccount(detail);
		push("/");
	};
</script>

<main in:fade>
	<NavClose title={$_("accounts.title")} />
	<AccountsModal
		list={$walletStore.identities}
		index={$walletStore.selectedAddress}
		on:selected={onSelectAccount}
	/>
</main>

<style lang="scss">
	@import "../styles";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
</style>
