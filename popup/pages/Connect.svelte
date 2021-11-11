<script lang="ts">
	import { fly } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';

	import appStore from 'popup/store/apps';

	import Loader from '../components/Loader.svelte';

	let loading = true;

	$: app = $appStore.confirmApp;

	const onload = (target) => {
		const event = 'load';
		target.addEventListener(event, () => {
			loading = false;
			target.removeEventListener(event, () => null, true);
		});
	}
</script>

<main>
	<h1>{app.title}</h1>
	<div class="img-wrap">
		<img
			src={app.icon}
			class:loading={loading}
			alt="logo"
			width="55px"
			height="55px"
			use:onload
		/>
		{#if loading}
			<Loader
				width="55px"
				height="55px"
			/>
		{/if}
	</div>
	<div>
		<h2>
			{$_('connect.question')[0]}
			<mark>
				{app.domain}
			</mark>
			{$_('connect.question')[1]}
		</h2>
		<p>
			{$_('connect.warn')}
		</p>
	</div>
	<div class="btn-wrap">
		<button class="primary">
			{$_('connect.btns.conf')}
		</button>
		<button>
			{$_('connect.btns.reject')}
		</button>
	</div>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;
		text-align: center;

		justify-content: space-between;

		@include flex-center-column;
	}
	h1 {
		@include text-shorten;
	}
	img {
		display: auto;
		&.loading {
			display: none;
		}
	}
	div,
	h1 {
		max-width: 500px;
		padding-left: 16px;
		padding-right: 16px;

		&.img-wrap {
			margin-block-start: 5vh;
			margin-block-end: 5vh;
		}
		&.btn-wrap {
			max-width: 400px;
			min-width: 290px;
			width: 100%;
			margin-block-start: 10vh;
			@include flex-between-row;

			& > button {
				margin: 5px;
			}
		}
	}
</style>
