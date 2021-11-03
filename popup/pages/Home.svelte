<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';

	import rateStore from 'popup/store/rate';
	import walletStore from 'popup/store/wallet';
	import currencyStore from 'popup/store/currency';
	import zrcStore from 'popup/store/zrc';

	import TopBar from '../components/TopBar.svelte';
	import GearIcon from '../components/GearIcon.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
	import TokenCard from '../components/TokenCard.svelte';

	$: zrc2Tokens = $walletStore.identities[$walletStore.selectedAddress].zrc2;
	$: rate = $rateStore[$currencyStore];

	onMount(() => {
		console.log(rate);
  });
</script>

<section
	in:fly={flyTransition.in}
	out:fly={flyTransition.out}
>
	<TopBar />
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<main>
		<h1 class="amount">
			$300
		</h1>
		<div class="btns">
			<button class="action">
				{$_('home.btns.send')}
			</button>
			<button class="action">
				{$_('home.btns.receive')}
			</button>
		</div>
		<div class="wrapper">
			{#each $zrcStore as token}
        <TokenCard
					address={token.bech32}
					symbol={token.symbol}
					balance={zrc2Tokens[token.base16] || '0'}
				/>
      {/each}
		</div>
		<button class="add">
			<GearIcon
				width="25px"
				height="25px"
			/>
			{$_('home.token_list')}
		</button>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 96px);
		z-index: 3;

		@include flex-center-top-column;
	}
	h1 {
		color: var(--text-color);
		text-align: center;
    margin-top: 30px;
		font-family: Demi;
		margin-block-end: 15px;

		@include fluid-font(320px, 900px, 38px, 60px);
	}
	img {
		position: fixed;
		max-width: 900px;
		width: 130vw;
		margin: 0% auto;
		left: auto;
		right: auto;
		top: -47px;
		opacity: 0.5;
	}
	div.wrapper {
		margin-top: 30px;
		min-width: 290px;
		flex-wrap: wrap;
    display: flex;
    justify-content: space-between;
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	button.action {
		min-width: 120px;
		line-height: 30px;
	}
	button.add {
		min-width: 300px;
		color: var(--primary-color);

		&:hover {
			color: var(--background-color);
		}
	}
	:global(button.add > svg > path) {
		fill: var(--primary-color) !important;
	}
	:global(button.add:hover > svg > path) {
		fill: var(--background-color) !important;
	}
</style>
