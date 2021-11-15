<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, blur, fly, slide, scale } from "svelte/transition";
	import { _ } from 'popup/i18n';
	import { getQrCOde } from 'popup/backend/wallet';

	import walletStore from 'popup/store/wallet';

	import NavClose from '../../components/NavClose.svelte';

	let base58 = '';
	let index = $walletStore.selectedAddress;

	$: account = $walletStore.identities[index];

	onMount(async() => {
		base58 = await getQrCOde(index);
	});
</script>

<main>
	<NavClose title={$_('account.title')}/>
	<div class="warp">
		{#if base58}
			<img in:blur src={base58}/>
		{/if}
	</div>
</main>

<style lang="scss">
	@import "../../styles/mixins";
	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	div.warp {

	}
</style>
