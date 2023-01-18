<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { link, push } from 'svelte-spa-router';
	import { TokenType } from 'popup/config/token-type';
	import { uuidv4 } from 'lib/crypto/uuid';

	import { jazziconCreate } from 'popup/mixins/jazzicon';
	import { balanceUpdate } from 'popup/backend/wallet';
	import { updateRate } from 'popup/backend/settings';

	import walletStore from 'popup/store/wallet';
	import zrcStore from 'popup/store/zrc';
	import netwrok from 'app/store/netwrok';

	import TopBar from '../components/TopBar.svelte';
	import LeftNavBar from '../components/LeftNavBar.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
	import TokenCard from '../components/TokenCard.svelte';
	import CopyAccount from '../components/CopyAccount.svelte';
	import Burger from '../components/Burger.svelte';
	import Manage from '../components/icons/Manage.svelte';

	import { AccountTypes } from 'config/account-type';
	import { NETWORK_KEYS } from 'config/network';


	const [, testnet] = NETWORK_KEYS;
	let loading = false;
	let leftBar = false;
	let uuid = uuidv4();

	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: zrc2Tokens = account.zrc2;

	const onRefresh = async (rate = false) => {
		loading = true;
		try {
			await balanceUpdate();
		} catch (err) {
			// alert(err.message);
		}
		if (rate) {
			try {
				await updateRate();
			} catch (err) {
				// alert(err.message);
			}
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
		on:refresh={() => onRefresh(true)}
	/>
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<main>
		<div class="bar-wrapper">
			<div on:mouseup={onToggleLeftBar}>
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
		<div class="btns">
			<button
				class="secondary"
				disabled={account.type === AccountTypes.Track}
				on:mouseup={() => push(`/send/${TokenType.ZRC2}/0`)}
			>
				{$_('home.btns.send')}
			</button>
			<button
				on:mouseup={() => push('/account')}
			>
				{$_('home.btns.receive')}
			</button>
			<button
				on:mouseup={() => push('/stake')}
				disabled={$netwrok.selected !== testnet}
			>
				{$_('home.btns.stake')}
			</button>
		</div>
		<div class="manager">
			<div />
			<div
				class="add"
				on:mouseup={() => push('/tokens-list')}
			>
				<Manage />
			</div>
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
					disabled={Boolean(account.type === AccountTypes.Track)}
					on:select={() => push(`/send/${TokenType.ZRC2}/${index}`)}
				/>
      {/each}
		</div>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles";
	main {
		height: calc(100vh - 86px);
		z-index: 3;

		@include flex-center-top-column;
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
	div.manager,
	div.wrapper {
		padding-left: 10px;
		padding-right: 10px;

		min-width: 290px;
		max-width: 320px;

		width: fit-content;
	}
	div.manager {
		display: flex;
    width: 100%;
    justify-content: end;

		margin-block-start: 8px;

		& > div {
			cursor: pointer;
		}
	}
	div.wrapper {
		flex-wrap: wrap;

    display: flex;
    justify-content: flex-start;

		overflow-y: scroll;
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	div.btns {
		@include flex-center-horiz;

		& > button {
			min-width: 80px;
			line-height: 30px;
			margin: 5px;
		}
	}
	div.bar-wrapper {
		max-width: 500px;
    width: calc(100vw - 25px);
		@include flex-between-row;
	}
	:global(button.add > svg > path) {
		fill: var(--text-color) !important;
	}
	:global(div.add:hover > svg > path) {
		stroke: var(--primary-color) !important;
	}
</style>
