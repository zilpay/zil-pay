<script lang="ts">
	import { _ } from 'popup/i18n';
	import { fade } from 'svelte/transition';

  import NavClose from '../components/NavClose.svelte';
	import SearchBox from '../components/SearchBox.svelte';
	import SvgLoader from '../components/SvgLoader.svelte';
	import AddTokenModal from '../modals/AddToken.svelte';
  import Modal from '../components/Modal.svelte';

	let tokenAddModal = false;
</script>

<Modal
  show={tokenAddModal}
  title={$_('tokens_list.modals.add.title')}
  on:close={() => tokenAddModal = !tokenAddModal}
>
	<AddTokenModal />
</Modal>
<main in:fade>
	<NavClose title={$_('tokens_list.title')}/>
	<SearchBox
		placeholder={$_('tokens_list.placeholder')}
		focus
	>
		<span
			class="add"
			on:click={() => tokenAddModal = !tokenAddModal}
		>
			<SvgLoader src="/vectors/add.svg"/>
		</span>
	</SearchBox>
	<div></div>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
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
