<script lang="ts">
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';

	import { updateNFTList, getNFTList } from 'popup/backend/tokens';
  import { viewIcon } from 'lib/block-explorer/view';

	import walletStore from 'popup/store/wallet';
  import themeStore from 'popup/store/theme';
	import nftListStore from 'popup/store/nft-list';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import SearchBox from '../components/SearchBox.svelte';
	import NFTCard from '../components/NFTCard.svelte';

	let search = '';
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
			alert(err.message);
		}
		console.log($nftListStore);
		loading = false;
	}

	onMount(async() => {
		const list = await getNFTList();

		if (list.length === 0) {
			await update();
		}
	});
</script>

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
		/>
		<ul>
			{#each tokens as item}
				<li>
					<div class="header">
						<img
							height="30"
							src={viewIcon(item.bech32, $themeStore)}
							alt="logo"
						/>
						<h3>
							{item.name} ({item.symbol})
						</h3>
					</div>
					<div class="wrapper">
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

		height: calc(100vh - 167px);

		@include flex-center-top-column;

		& > li {
			width: calc(100vw - 30px);
			max-width: 576px;

			@include flex-column;

			& > .header {
				margin-block-start: 15px;
				@include flex-between-row;
			}
			& > .wrapper {
				flex-wrap: wrap;

				@include flex-between-row;
			}
		}
	}
</style>
