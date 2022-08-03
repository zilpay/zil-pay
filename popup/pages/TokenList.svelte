<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
	import { fly } from 'svelte/transition';

  import { viewIcon } from 'lib/block-explorer/view';
	import {
		removeZRC2Token,
		getTokens,
		getZRC2State,
		addZRC2Token
	} from 'popup/backend/tokens';

	import zrcStore from 'app/store/zrc';
  import themeStore from 'popup/store/theme';
  import netStore from 'popup/store/netwrok';

  import NavClose from '../components/NavClose.svelte';
	import SearchBox from '../components/SearchBox.svelte';
	import AddIcon from '../components/icons/Add.svelte';
	import AddTokenModal from '../modals/AddToken.svelte';
  import Modal from '../components/Modal.svelte';
	import Toggle from '../components/Toggle.svelte';
	import SkeletToken from '../components/skelet/SkeletToken.svelte';

	import { NETWORK_KEYS } from 'config/network';

	let limit = 100;
	let offset = 0;
	let count = $zrcStore.length + 3;

	let search = '';
	let loading = true;
	let tokenAddModal = false;
	let zrc2List = $zrcStore.slice(2).map(
		(t) => ({
			...t,
			selected: true,
			loading: false
		})
	);

	$: unique = new Set(zrc2List.map((t) => t.base16));
	$: tokens = Array
		.from(unique)
		.map((base16) => zrc2List.find((t) => t.base16 === base16))
		.filter(Boolean)
		.filter((t) => {
			const t0 = t.name.toLowerCase().includes(search.toLowerCase());
			const t1 = t.symbol.toLowerCase().includes(search.toLowerCase());

			return t0 || t1;
		});


	async function listUpdate() {
		// 3 is magic number.
		if (count <= zrc2List.length + 3) {
			return;
		}
		loading = true;
		let list = [];
		try {
			const res = await getTokens(limit, offset);
			count = res.count;
			list = res.list.filter(
				(t) => !$zrcStore.some((s) => s.symbol === t.symbol)
			);
			list = list.map((t) => ({
				...t,
				selected: false,
				loading: false
			}));

			zrc2List = [...zrc2List, ...list];
		} catch (err) {
			console.error(err);
		}
		loading = false;
	}

	async function handleOnToggle(token, index) {
		zrc2List[index].loading = true;
		if (token.selected) {
			const foundIndex = $zrcStore.findIndex(
				(t) => t.base16 === token.base16
			);
			await removeZRC2Token(foundIndex);
		} else {
			try {
				const state = await getZRC2State(token.bech32);
				await addZRC2Token(state);
			} catch (err) {
				console.error(err);
			}
		}
		zrc2List[index].loading = false;
	}

	function hanldeScroll(event) {
		if ($netStore.selected !== NETWORK_KEYS[0]) {
			return;
		}

		const scrollHeight = event.target.scrollHeight;
		const scrollTop = event.target.scrollTop;
		const scroll = Math.ceil(window.innerHeight + scrollTop) - 100;

		if (scroll >= scrollHeight && !loading) {
			offset += limit;
			listUpdate();
		}
	}

	onMount(async() => {
		if ($netStore.selected === NETWORK_KEYS[0]) {
			await listUpdate();
		}

		loading = false;
	});
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
	<ul on:scroll={hanldeScroll}>
		{#each tokens as token, i}
			<li class:loading={token.loading}>
				<img
					src={viewIcon(token.bech32, $themeStore)}
					alt={token.symbol}
					width="36"
					loading="lazy"
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
						checked={token.selected}
						disabled={token.loading}
						on:toggle={() => handleOnToggle(token, i)}
					/>
				</span>
			</li>
		{/each}
		{#if loading}
			<li class="loading">
				<SkeletToken />
			</li>
		{/if}
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

			&.loading {
				@include loading-gradient(var(--background-color), var(--card-color));
			}

			& > div {
				width: 100%;
				padding-left: 10px;

				& > * {
					@include text-shorten;
					max-width: 120px;					
				}
				& > h3 {
					margin-block-end: 0.3em;
				}
			}
		}
	}
</style>
