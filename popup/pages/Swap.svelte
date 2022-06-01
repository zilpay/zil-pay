<script lang="ts">
	import { _ } from 'popup/i18n';
	import Big from 'big.js';
	import { push } from 'svelte-spa-router';
	import { onMount, onDestroy } from 'svelte';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import Smartinput from '../components/SmartInput.svelte';
	import SwapIcon from '../components/icons/Swap.svelte';
  import TokensModal from '../modals/Tokens.svelte';
  import Modal from '../components/Modal.svelte';
	import SwapInfo from '../components/SwapInfo.svelte';

  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';

	import zrcStore from 'popup/store/zrc';
	import currencyStore from 'popup/store/currency';
	import rateStore from 'popup/store/rate';
  import themeStore from 'popup/store/theme';
	import walletStore from 'popup/store/wallet';
  import netStore from 'popup/store/netwrok';

	import { updateDexData } from 'popup/backend/settings';
	import { balanceUpdate } from 'popup/backend/wallet';
  import { formatNumber } from 'popup/filters/n-format';

	import { ZIlPayDex } from 'popup/mixins/dex';
	import { BrowserStorage } from 'lib/storage/browser-storage';

	const dex = new ZIlPayDex();

  let modals = [
		$_('swap.modals.from'),
		$_('swap.modals.to')
	];
	let loading = false;
	let buttonLoading = false;
	let modalIndex = -1;
	let gasLimit = 0;
	let approved = true;
	let tokens = [
		{
			value: '0',
			meta: $zrcStore[0],
			approved: Big(-1)
		},
		{
			value: '0',
			converted: 0,
			meta: $zrcStore[1],
			approved: Big(0)
		}
	];


	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: listedTokens = $zrcStore.filter(
		(t) => (t.pool || t.base16 === $zrcStore[0].base16)
			&& (t.base16 !== tokens[0].meta.base16 && (tokens[1].meta && t.base16 !== tokens[1].meta.base16))
	);
	$: disabled = loading || Number(tokens[0].value) <= 0;


	async function hanldeOnSwapTokens() {
		tokens = tokens.reverse();
		const { amount, converted, gas } = dex.getRealAmount(tokens);
		tokens[1].value = String(amount);
		tokens[1].converted = converted;
		gasLimit = gas;

		tokens[0].approved = await dex.isAllowed(tokens);
	}

	function hanldeOnInput(value: string, index: number) {
		try {
			tokens[index].value = String(Big(value));
		} catch {
			tokens[index].value = String(Big(0));
		}

		const { amount, converted, gas } = dex.getRealAmount(tokens);
		tokens[1].value = String(amount);
		tokens[1].converted = converted;
		gasLimit = gas;
	}

	function hanldeOnSelect(index: number) {
		modalIndex = index;
	}

	async function onSelectToken({ detail }) {
		const token = listedTokens[detail];

		tokens[modalIndex].meta = token;
		tokens[modalIndex].balance = fromDecimals(account.zrc2[token.base16], token.decimals);
		tokens[0].value = '0';
		tokens[1].value = '0';

		hanldeOnInput(tokens[0].value, 0);

		modalIndex = -1;

		tokens[0].approved = await dex.isAllowed(tokens);
	}

	function updatePool() {
		const [inputToken, outputToken] = tokens;
		const foundInput = $zrcStore.find((t) => t.base16 === inputToken.meta.base16);
		const foundOutput = $zrcStore.find((t) => t.base16 === outputToken.meta.base16);

		tokens[0].meta = foundInput;
		tokens[1].meta = foundOutput;
	}

	async function hanldeOnRefresh() {
		loading = true;
		try {
			await updateDexData();
			await balanceUpdate();
			updatePool();
			hanldeOnInput(tokens[0].value, 0);
		} catch {
			/////
		}
		loading = false;
	}

	async function handleSubmit(e) {
		e.preventDefault();
		buttonLoading = true;

		try {
			await dex.swap(tokens);

			buttonLoading = false;

			push('/confirm');
		} catch {
			/// TODO: track errors.
		}

		buttonLoading = false;
	}

	const storageObserver = BrowserStorage.subscribe(async(event) => {
		if (event['blocknumber']) {
			await balanceUpdate();
			updatePool();

			if (tokens[0]) {
				hanldeOnInput(tokens[0].value, 0);
			}
		}
	});

	onMount(() => {
		hanldeOnRefresh();
		updatePool();
	});

	onDestroy(() => {
		storageObserver.unsubscribe();
	});
</script>

<Modal
  show={Boolean(modals[modalIndex])}
  title={String(modals[modalIndex])}
  on:close={() => modalIndex = -1}
>
  <div class="m-warp">
    <TokensModal
      list={listedTokens}
      account={account}
			on:selected={onSelectToken}
    />
  </div>
</Modal>
<section>
	<TopBar
    refresh
    view
    lock
		on:refresh={hanldeOnRefresh}
	/>
	<main>
		{#if tokens[0].meta && tokens[1].meta && tokens[1].meta.pool}
			<form on:submit={handleSubmit}>
				<div class="header">
					<h3>
						{$_('swap.form.from')}
					</h3>
					<a
						href="https://zilpay.io/pool"
						target="_blank"
					>
						{$_('swap.form.pool')}
					</a>
				</div>
				<Smartinput
					img={viewIcon(tokens[0].meta.bech32, $themeStore)}
					symbol={tokens[0].meta.symbol}
					max={fromDecimals(account.zrc2[tokens[0].meta.base16], tokens[0].meta.decimals)}
					value={tokens[0].value}
					loading={loading}
					on:select={() => hanldeOnSelect(0)}
					on:input={(event) => hanldeOnInput(event.detail, 0)}
				/>
				<div class="seporate">
					<h3>
						{$_('swap.form.to')}
					</h3>
					<span on:click={hanldeOnSwapTokens}>
						<SwapIcon className="swap-icon"/>
					</span>
				</div>
				<Smartinput
					img={viewIcon(tokens[1].meta.bech32, $themeStore)}
					symbol={tokens[1].meta.symbol}
					value={tokens[1].value}
					loading={loading}
					percents={[]}
					disabled={true}
					converted={tokens[1].converted}
					on:select={() => hanldeOnSelect(1)}
				/>
				<SwapInfo
					pair={tokens}
					gasLimit={gasLimit}
				/>
				<button
					class:loading={buttonLoading}
					disabled={disabled}
				>
					{$_('swap.form.button')}
				</button>
			</form>
		{/if}
		<a
			href="https://zilpay.io/"
			target="_blank"
		>
			<p>
				{$_('swap.form.link')}
			</p>
		</a>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		padding-top: 5vh;
    height: calc(100vh - 86px);
		@include flex-center-column;
	}
	form {
		@include flex-center-column;

		min-width: 290px;
    max-width: 500px;
    width: 100%;

		& > div.header {
			width: 100%;

			padding-left: 8px;
			padding-right: 8px;
			
			@include flex-between-row;

			& > h3 {
				margin: 0;
			}
			& > a {
				color: var(--muted-color);
				font-family: Demi;

				&:hover {
					color: var(--text-color);
				}
			}
		}
		& > div.seporate {
			width: 100%;
			padding-left: 8px;
			padding-right: 8px;

			@include flex-between-row;

			& > h3 {
				margin: 0;
			}
			& > span {
				cursor: pointer;

				&:hover {
					& > :global(.swap-icon > path) {
						fill: var(--text-color);
					}
				}
			}
		}
		& > button {
			width: 100%;
		}
		& > :global(label),
		& > button {
			margin-block-end: 5px;
			margin-block-start: 5px;

			&:disabled {
				&:hover {
					border-color: var(--button-color);
					background: var(--button-color);
					color: var(--primary-color);
				}
			}
		}
	}
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
