<script lang="ts">
	import { scale } from 'svelte/transition';
	import { _ } from 'popup/i18n';
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { closePopup } from 'popup/mixins/popup';

	import appStore from 'popup/store/apps';
	import { userResponseConnection } from 'popup/backend/popup';

	let app = $appStore.confirmApp;

	onMount(() => {
		if (!$appStore.confirmApp) {
			push('/');
		}
	});

	const hanldeOnConfirm = async () => {
		try {
			await userResponseConnection(true);
		} catch {
			///
		}
		await closePopup();
		push('/');
	};
	const hanldeOnReject = async () => {
		await userResponseConnection(false);
		await closePopup();
		push('/');
	};
</script>

{#if Boolean(app)}
	<main in:scale>
		<h1>{app.title}</h1>
		<img
			src={app.icon}
			alt="logo"
			width="55px"
			height="55px"
		/>
		<div>
			<h2>
				{$_('connect.question.0')}
				<mark>
					{app.domain}
				</mark>
				{$_('connect.question.1')}
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
		margin: 16px;
		display: auto;
	}
	div,
	h1 {
		max-width: 500px;
		width: calc(100vw - 30px);
		padding-left: 16px;
		padding-right: 16px;
	}
	div {
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
