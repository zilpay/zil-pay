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
			<div class="info">
				<p>
					1 ZIL = 123, 32.534543 ZLP <span>($100)</span>
				</p>
			</div>
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
		padding-top: 10vh;
    height: calc(100vh - 86px);
		@include flex-column;
	}
	form {
		@include flex-center-column;

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
