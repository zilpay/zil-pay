<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';

	import TopBar from '../components/TopBar.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
</script>

<section
	in:fly={flyTransition.in}
	out:fly={flyTransition.out}
>
	<TopBar />
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<main>
		<h1 class="amount">
			$300
		</h1>
		<div class="btns">
			<button>
				{$_('home.btns.send')}
			</button>
			<button>
				{$_('home.btns.receive')}
			</button>
		</div>
		<div></div>
	</main>
	<BottomTabs />
</section>

<style type="text/scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 96px);
		z-index: 3;
	}
	h1 {
		text-align: center;
    margin-top: 30px;
		font-family: Demi;
		margin-block-end: 15px;

		@include fluid-font(320px, 900px, 38px, 60px);
	}
	img {
		position: fixed;
		max-width: 900px;
		width: 130vw;
		margin: 0% auto;
		left: auto;
		right: auto;
		top: -47px;
		opacity: 0.5;
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	button {
		min-width: 120px;
		line-height: 30px;
	}
</style>
