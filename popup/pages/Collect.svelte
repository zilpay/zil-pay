<script lang="ts">
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';

	import { TokenType } from 'popup/config/token-type';

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
	import NFTListModal from '../modals/NFTList.svelte';

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

	async function handleOnRemove({ detail }) {
		try {
			await removeNFTToken(detail);
		} catch (err) {
			alert(err.message);
		}
	}

	function handleSelect({ detail }) {
		push(`/send/${TokenType.ZRC1}/${detail.index}/${detail.tokenIndex}`);
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
		<NFTListModal
			tokens={tokens}
			loading={loading}
			toggle
			bottom
			on:remove={handleOnRemove}
			on:select={handleSelect}
		/>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		padding-block-start: 30px;

		@include flex-center-top-column;
	}
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
