<script lang="ts">
	import { _ } from 'popup/i18n';

	import { Runtime } from 'lib/runtime';

	import NavClose from '../../components/NavClose.svelte';

	const version = Runtime.runtime.getManifest().version

	const links = [
		{
			name: 'Issues',
			url: 'https://github.com/zilpay/zil-pay'
		},
		{
			name: 'Privacy policy',
			url: 'https://zilpay.io/policy'
		},
		{
			name: 'Terms and use',
			url: 'https://zilpay.io/terms'
		}
	];
</script>

<main>
	<NavClose title={$_('about.title')}/>
	<h1>
		ZIlPay {$_('about.version')} - {version}
	</h1>
	<ul>
		{#each links as link}
			<li>
				<a
					href={link.url}
					target="_blank"
				>
					{link.name}
				</a>
			</li>
		{/each}
	</ul>
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	h1 {
		@include fluid-font(320px, 1024px, 22px, 55px);
	}
	ul {
		margin: 0;
    padding: 0;
		z-index: 2;
		& > li {
			text-align: center;
		}
		& > li > a {
			cursor: pointer;
			font-family: Demi;
			color: var(--text-color);
			line-height: 30px;
			font-size: 21px;

			&:hover {
				color: var(--primary-color);
			}
		}
	}
	img {
		position: fixed;
		max-width: 900px;
		width: 130vw;
		margin: 15vh auto;
		left: auto;
		right: auto;
		top: -47px;
		opacity: 0.5;
	}
</style>
