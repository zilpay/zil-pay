<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import Big from 'big.js';
	import { link, push } from 'svelte-spa-router';
	import { TokenType } from 'popup/config/token-type';
	import { uuidv4 } from 'lib/crypto/uuid';

	import { fromDecimals } from 'popup/filters/units';
	import { convertRate } from 'popup/filters/convert-rate';
	import { formatNumber } from 'popup/filters/n-format';
	import { jazziconCreate } from 'popup/mixins/jazzicon';
	import { balanceUpdate } from 'popup/backend/wallet';

	import rateStore from 'popup/store/rate';
	import walletStore from 'popup/store/wallet';
	import currencyStore from 'popup/store/currency';
	import zrcStore from 'popup/store/zrc';

	import TopBar from '../components/TopBar.svelte';
	import GearIcon from '../components/GearIcon.svelte';
	import LeftNavBar from '../components/LeftNavBar.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
	import TokenCard from '../components/TokenCard.svelte';
	import CopyAccount from '../components/CopyAccount.svelte';
	import Burger from '../components/Burger.svelte';

	let loading = false;
	let leftBar = false;
	let uuid = uuidv4();

	$: ZIL = $zrcStore[0];
	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: zrc2Tokens = account.zrc2;
	$: rate = $rateStore[$currencyStore];
	$: balance = $zrcStore.reduce((previousValue, currentValue, index) => {
		const qa = account.zrc2[currentValue.base16] || '0';
		const balance = fromDecimals(qa, currentValue.decimals);
		const tokenRate = Big(currentValue.rate || 1);
		const zils = tokenRate.mul(balance);

		return previousValue.add(zils);
	}, Big(0));
	$: converted = convertRate(rate, balance);

	const onRefresh = async () => {
		loading = true;
		try {
			await balanceUpdate();
		} catch (err) {
			alert(err.message);
		}
		loading = false;
	};
	const onToggleLeftBar = () => {
		leftBar = !leftBar;
	};

	onMount(async() => {
		jazziconCreate(uuid, account.base16);
		await onRefresh();
	});
</script>

<LeftNavBar
	show={leftBar}
	on:close={onToggleLeftBar}
/>
<section>
	<TopBar
		refresh
		view
		lock
		on:refresh={onRefresh}
	/>
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<main>
		<div class="bar-wrapper">
			<div on:click={onToggleLeftBar}>
				<Burger />
			</div>
			<CopyAccount />
			<a
				href="/accounts"
				class="acc"
				use:link
			>
				<div id={uuid}/>
			</a>
		</div>
		<h1 class="amount">
			{formatNumber(converted, $currencyStore)}
		</h1>
		<div class="btns">
			<button
				class="action"
				on:click={() => push(`/send/${TokenType.ZRC2}/0`)}
			>
				{$_('home.btns.send')}
			</button>
			<button
				class="action"
				on:click={() => push('/account')}
			>
				{$_('home.btns.receive')}
			</button>
		</div>
		<div class="wrapper">
			{#each $zrcStore as token, index}
        <TokenCard
					address={token.bech32}
					symbol={token.symbol}
					decimal={token.decimals}
					tokenRate={token.rate}
					balance={zrc2Tokens[token.base16] || '0'}
					loading={loading}
					on:select={() => push(`/send/${TokenType.ZRC2}/${index}`)}
				/>
      {/each}
		</div>
		<button
			class="add"
			on:click={() => push('/tokens-list')}
		>
			<GearIcon
				width="24px"
				height="24px"
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
		font-family: Demi;
		margin-block-end: 0;
		margin-block-start: 0;

		@include fluid-font(320px, 900px, 28px, 60px);
	}
	a.acc {
		border: solid 2px var(--muted-color);

		@include border-radius(100%);

		& > div {
			height: 30px;
			width: 30px;
		}
		&:hover {
			border: solid 2px var(--primary-color);
		}
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
		padding-left: 10px;
		padding-right: 10px;

		min-width: 290px;
		max-width: 320px;
		width: fit-content;

		flex-wrap: wrap;

    display: flex;
    justify-content: flex-start;

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
		min-width: 290px;
		color: var(--primary-color);
		margin-block-start: 5px;
		margin-block-end: 5px;

		&:hover {
			color: var(--background-color);
		}
	}
	div.bar-wrapper {
		max-width: 500px;
    width: calc(100vw - 25px);
		@include flex-between-row;
	}
	:global(button.add > svg > path) {
		fill: var(--primary-color) !important;
	}
	:global(button.add:hover > svg > path) {
		fill: var(--background-color) !important;
	}
</style>
