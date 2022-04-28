<script lang="ts">
	import { _ } from 'popup/i18n';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
	import Smartinput from '../components/SmartInput.svelte';
	import SwapIcon from '../components/icons/Swap.svelte';
</script>

<section>
	<TopBar
    refresh
    view
    lock
	/>
	<main>
		<form>
			<Smartinput
				img="https://meta.viewblock.io/zilliqa.ZIL/logo?t=light"
				symbol="ZIL"
			/>
			<span>
				<SwapIcon className="swap-icon"/>
			</span>
			<Smartinput
				img="https://meta.viewblock.io/zilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4/logo?t=light"
				symbol="ZLP"
			/>
			<button>
				Exchange
			</button>
		</form>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
    height: calc(100vh - 86px);
		@include flex-center-column;
	}
	form {
		@include flex-center-column;

		& > span {
			cursor: pointer;

			&:hover {
				& > :global(.swap-icon > path) {
					fill: var(--text-color);
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
