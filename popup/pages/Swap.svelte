<script lang="ts">
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import Smartinput from '../components/SmartInput.svelte';
	import SwapIcon from '../components/icons/Swap.svelte';
  import TokensModal from '../modals/Tokens.svelte';
  import Modal from '../components/Modal.svelte';

  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';

	import zrcStore from 'popup/store/zrc';
	import currencyStore from 'popup/store/currency';
	import rateStore from 'popup/store/rate';
  import themeStore from 'popup/store/theme';
	import walletStore from 'popup/store/wallet';

	import { updateDexData } from 'popup/backend/settings';
	import { balanceUpdate } from 'popup/backend/wallet';

  let modals = [
		'Swap From token',
		'Swap To token'
	];
	let loading = false;
	let modalIndex = -1;
	let tokens = [
		{
			value: '0',
			meta: $zrcStore[0]
		},
		{
			value: '0',
			meta: $zrcStore[1]
		}
	];


	$: account = $walletStore.identities[$walletStore.selectedAddress];
	$: listedTokens = $zrcStore.filter(
		(t) => (t.pool || t.base16 === $zrcStore[0].base16)
			&& (t.base16 !== tokens[0].meta.base16 && t.base16 !== tokens[1].meta.base16)
	);


	function hanldeOnSwapTokens() {
		tokens = tokens.reverse();
	}

	function hanldeOnInput(value: string, index: number) {
		tokens[index].value = value;
	}

	function hanldeOnSelect(index: number) {
		modalIndex = index;
	}

	function onSelectToken({ detail }) {
		const token = listedTokens[detail];

		tokens[modalIndex].meta = token;
		tokens[modalIndex].balance = fromDecimals(account.zrc2[token.base16], token.decimals);
		tokens[0].value = '0';
		tokens[1].value = '0';

		modalIndex = -1;
	}

	async function hanldeOnRefresh() {
		loading = true;
		try {
			await updateDexData();
			await balanceUpdate();
		} catch {
			/////
		}
		loading = false;
	}

	onMount(() => {
		hanldeOnRefresh();
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
		<form>
			<div class="header">
				<h3>
					Swap From:
				</h3>
				<a
					href="https://zilpay.io/pool"
					target="_blank"
				>
					Add Pool
				</a>
			</div>
			{#each tokens as el, index}
				<Smartinput
					img={viewIcon(tokens[index].meta.bech32, $themeStore)}
					symbol={tokens[index].meta.symbol}
					max={fromDecimals(account.zrc2[tokens[index].meta.base16], tokens[index].meta.decimals)}
					value={tokens[index].value}
					loading={loading}
					on:select={() => hanldeOnSelect(index)}
					on:input={(event) => hanldeOnInput(event.detail, index)}
				/>
				{#if index === 0}
					<span on:click={hanldeOnSwapTokens}>
						<SwapIcon className="swap-icon"/>
					</span>
				{/if}
			{/each}
			<div class="info">
				<p>
					1 ZIL = 123, 32.534543 ZLP <span>($100)</span>
				</p>
			</div>
			<button disabled={loading}>
				Exchange
			</button>
		</form>
		<div class="info">
			<h3>
				Swap {tokens[0].value} {tokens[0].meta.symbol} for {tokens[1].value} {tokens[1].meta.symbol}
			</h3>
		</div>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		padding-top: 5vh;
    height: calc(100vh - 86px);
		@include flex-center-column;

		& > div.info {
			margin-block-start: 16px;
			border-radius: 16px;
			background: var(--card-color);
			padding: 8px;
			width: 100%;
			height: 100px;
		}
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

				&:hover {
					color: var(--text-color);
				}
			}
		}
		& > span {
			cursor: pointer;

			&:hover {
				& > :global(.swap-icon > path) {
					fill: var(--text-color);
				}
			}
		}
		& > div.info {
			width: 100%;
			text-indent: 8px;
			margin-block-end: 5px;
			margin-block-start: 5px;

			& > p {
				color: var(--text-color);
				cursor: pointer;
				margin: 0;
				font-size: 0.7rem;

				& > span {
					color: var(--muted-color);
				}
			}
		}
		& > button {
			width: 100%;
		}
		& > :global(label) {
			margin-block-end: 5px;
			margin-block-start: 5px;
		}
	}
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
