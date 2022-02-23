<script lang="ts">
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

	import {
		updateNFTList,
		getNFTList,
		removeNFTToken
	} from 'popup/backend/tokens';
  import { viewIcon } from 'lib/block-explorer/view';

	import walletStore from 'popup/store/wallet';
  import themeStore from 'popup/store/theme';
	import nftListStore from 'popup/store/nft-list';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import SearchBox from '../components/SearchBox.svelte';
	import NFTCard from '../components/NFTCard.svelte';
	import AddIcon from '../components/icons/Add.svelte';
	import AddNFTModal from '../modals/AddNFT.svelte';
  import Modal from '../components/Modal.svelte';
	import Toggle from '../components/Toggle.svelte';

	let search = '';
	let tokenAddModal = false;
	let loading = false;

  $: account = $walletStore.identities[$walletStore.selectedAddress];
	$: tokens = $nftListStore.filter((t) => {
		const t0 = t.name.toLowerCase().includes(search.toLowerCase());
		const t1 = t.symbol.toLowerCase().includes(search.toLowerCase());

		return t0 || t1;
	});

	async function update() {
		loading = true;
		try {
			await updateNFTList();
		} catch (err) {
			// alert(err.message);
		}
		loading = false;
	}

	async function handleOnRemove(index: number) {
		try {
			await removeNFTToken(index);
		} catch (err) {
			alert(err.message);
		}
	}

	onMount(async() => {
		const list = await getNFTList();

		if (list.length === 0) {
			await update();
		}
	});
</script>

<Modal
  show={tokenAddModal}
  title={$_('collections.modals.add.title')}
  on:close={() => tokenAddModal = !tokenAddModal}
>
	<AddNFTModal on:close={() => tokenAddModal = !tokenAddModal}/>
</Modal>
<section>
	<TopBar
    refresh
    view
    lock
		on:refresh={() => update()}
	/>
	<main>
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
			{#if tokens.length === 0}
				<p>
					{$_('collections.no_tokens')}
				</p>
			{/if}
			{#each tokens as item, index}
				<li>
					<div class="header">
						<div>
							<img
								height="30"
								src={viewIcon(item.bech32, $themeStore)}
								alt="logo"
							/>
							<h3>
								{item.name} ({item.symbol})
							</h3>
						</div>
						<Toggle
							checked={item}
							on:toggle={() => handleOnRemove(index)}
						/>
					</div>
					<div class="wrapper">
						{#if item.balances.length === 0}
							<p>
								{$_('collections.empty.0')} ({item.symbol}) {$_('collections.empty.1')}
							</p>
						{/if}
						{#each item.balances as token}
							<NFTCard
								url={Boolean(token.meta) ? token.meta.image : token.url}
								load={loading}
								id={token.id}
							/>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		@include flex-center-top-column;
	}
	p {
		text-align: left;
    width: 280px;
	}
	main, ul {
		padding-block-start: 30px;
	}
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	ul {
		margin: 0;
		padding: 0;
    overflow-y: scroll;
		
		margin-block-start: 15px;

		height: calc(100vh - 182px);

		@include flex-center-top-column;

		& > li {
			width: calc(100vw - 30px);
			max-width: 576px;
			margin-block-start: 5px;
			margin-block-end: 5px;

			@include flex-column;

			& > .header {
				@include flex-between-row;

				& > div {
					@include flex-between-row;
					& > h3 {
						text-indent: 10px;
					}
				}
			}
			& > .wrapper {
				flex-wrap: wrap;

				@include flex-between-row;
			}
		}
	}
</style>
