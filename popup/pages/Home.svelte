<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
  import { link } from 'svelte-spa-router';
	import { fly } from 'svelte/transition';

	import { fromDecimals } from 'popup/filters/units';
  import { convertRate } from 'popup/filters/convert-rate';
  import { formatNumber } from 'popup/filters/n-format';

	import rateStore from 'popup/store/rate';
	import walletStore from 'popup/store/wallet';
	import currencyStore from 'popup/store/currency';
	import zrcStore from 'popup/store/zrc';
	import { jazziconCreate } from 'popup/mixins/jazzicon';

	import TopBar from '../components/TopBar.svelte';
	import GearIcon from '../components/GearIcon.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
	import TokenCard from '../components/TokenCard.svelte';
	import CopyAccount from '../components/CopyAccount.svelte';
  import Burger from '../components/Burger.svelte';

	$: ZIL = $zrcStore[0];
	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: zrc2Tokens = account.zrc2;
	$: rate = $rateStore[$currencyStore];
  $: balance = fromDecimals(zrc2Tokens[ZIL.base16], ZIL.decimals);
  $: converted = convertRate(rate, balance);

	onMount(() => {
		jazziconCreate('jazzicon', account.base16);
  });
</script>

<section>
	<TopBar />
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<main
		in:fly={flyTransition.in}
		out:fly={flyTransition.out}
	>
		<div class="bar-wrapper">
			<Burger />
			<CopyAccount />
			<a
				href="/accounts"
				id="jazzicon"
				use:link
			>
				<div />
			</a>
		</div>
		<h1 class="amount">
			{formatNumber(converted, $currencyStore)}
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
					decimal={token.decimals}
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
		height: calc(100vh - 86px);
		z-index: 3;

		@include flex-center-top-column;
	}
	h1 {
		color: var(--text-color);
		text-align: center;
    // margin-top: 30px;
		font-family: Demi;
		margin-block-end: 0;
		margin-block-start: 0;

		@include fluid-font(320px, 900px, 28px, 60px);
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
		margin-top: 15px;
		min-width: 290px;
		flex-wrap: wrap;
    display: flex;
    justify-content: space-between;
		overflow-y: scroll;
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
	div.bar-wrapper {
		max-width: 500px;
    width: calc(100vw - 15px);
		@include flex-between-row;
	}
	:global(button.add > svg > path) {
		fill: var(--primary-color) !important;
	}
	:global(button.add:hover > svg > path) {
		fill: var(--background-color) !important;
	}
</style>
