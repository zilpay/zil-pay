<script lang="ts">
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';

	import appStore from 'popup/store/apps';
	import { userResponseConnection } from 'popup/backend/popup';

	import Loader from '../components/Loader.svelte';

	let loading = true;
	let app = $appStore.confirmApp;

	onMount(() => {
		console.log($appStore.confirmApp);
		
		if (!$appStore.confirmApp) {
			push('/');
		}
	});

	const onload = (target) => {
		const event = 'load';
		target.addEventListener(event, () => {
			loading = false;
			target.removeEventListener(event, () => null, true);
		});
	}
	const hanldeOnConfirm = async () => {
		await userResponseConnection(true);
		window.close();
		push('/');
	};
	const hanldeOnReject = async () => {
		await userResponseConnection(false);
		window.close();
		push('/');
	};
</script>

{#if Boolean(app)}
	<main in:scale>
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
			<button
				class="primary"
				on:click={hanldeOnConfirm}
			>
				{$_('connect.btns.conf')}
			</button>
			<button on:click={hanldeOnReject}>
				{$_('connect.btns.reject')}
			</button>
		</div>
	</main>
{/if}

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
		@include fluid-font(320px, 720px, 20px, 30px);
		@include text-shorten;
	}
	h2 {
		@include fluid-font(320px, 720px, 15px, 20px);
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
		width: calc(100vw - 30px);
		padding-left: 16px;
		padding-right: 16px;
	}
	div {
		&.img-wrap {
			margin-block-start: 2vh;
			margin-block-end: 2vh;
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
