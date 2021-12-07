<script lang="ts">
	import { _ } from 'popup/i18n';
	import { fly } from 'svelte/transition';

  import { viewIcon } from 'lib/block-explorer/view';
	import { removeZRC2Token } from 'popup/backend/tokens';

	import zrcStore from 'app/store/zrc';
  import themeStore from 'popup/store/theme';

  import NavClose from '../components/NavClose.svelte';
	import SearchBox from '../components/SearchBox.svelte';
	import AddIcon from '../components/icons/Add.svelte';
	import AddTokenModal from '../modals/AddToken.svelte';
  import Modal from '../components/Modal.svelte';
	import Toggle from '../components/Toggle.svelte';

	let search = '';
	let tokenAddModal = false;

	$: tokens = $zrcStore.slice(2).filter((t) => {
		const t0 = t.name.includes(search.toLowerCase());
		const t1 = t.symbol.includes(search.toLowerCase());

		return t0 || t1;
	});

	async function hanldeOnHide(token) {
		const foundIndex = $zrcStore.findIndex(
			(t) => t.base16 === token.base16
		);
		await removeZRC2Token(foundIndex);
	}
</script>

<Modal
  show={tokenAddModal}
  title={$_('tokens_list.modals.add.title')}
  on:close={() => tokenAddModal = !tokenAddModal}
>
	<AddTokenModal on:close={() => tokenAddModal = !tokenAddModal}/>
</Modal>
<main>
	<NavClose title={$_('tokens_list.title')}/>
	<SearchBox
		placeholder={$_('tokens_list.placeholder')}
		focus
		on:input={(e) => search = e.detail}
	>
		<span
			class="add"
			on:click={() => tokenAddModal = !tokenAddModal}
		>
			<AddIcon />
		</span>
	</SearchBox>
	<ul>
		{#each tokens as token, i}
			<li in:fly={{
					delay: 100 * i,
					duration: 400,
					y: -20
				}}
			>
				<img
					src={viewIcon(token.bech32, $themeStore)}
					alt={token.symbol}
					width="36"
				/>
				<div>
					<h3>
						{token.symbol}
					</h3>
					<b>
						{token.name}
					</b>
				</div>
				<span>
					<Toggle
						checked
						on:toggle={() => hanldeOnHide(token)}
					/>
				</span>
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
		margin: 0;
		padding: 0;
		margin-block-start: 25px;
    overflow-y: scroll;

		& > li {
			min-width: 270px;

			margin: 8px;
			padding: 5px;

			padding-left: 16px;
			padding-right: 16px;

			background-color: var(--card-color);
			border: solid 1px var(--card-color);

			@include border-radius(8px);
			@include flex-between-row;

			& > div {
				width: 100%;
				padding-left: 10px;

				& > * {
					@include text-shorten;
				}
				& > h3 {
					margin-block-end: 0.3em;
				}
			}
		}
	}
	span.add {
		cursor: pointer;
		width: 68px;
		margin: 4px;
		&:hover {
			:global(svg > rect) {
				fill: var(--background-color);
			}
			:global(svg > line) {
				stroke: var(--success-color);
			}
		}
	}
</style>
