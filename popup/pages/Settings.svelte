<script lang="ts">
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';

  import TopBar from '../components/TopBar.svelte';
	import BottomTabs from '../components/BottomTabs.svelte';
	import Arrow from '../components/icons/Arrow.svelte';

	let items = [
		{
			title: $_('settings.account.title'),
			description: $_('settings.account.description'),
			link: '/account'
		},
		{
			title: $_('settings.general.title'),
			description: $_('settings.general.description'),
			link: '/general'
		},
		{
			title: $_('settings.contacts.title'),
			description: $_('settings.contacts.description'),
			link: '/contacts'
		},
		{
			title: $_('settings.advanced.title'),
			description: $_('settings.advanced.description'),
			link: '/advanced'
		},
		{
			title: $_('settings.networks.title'),
			description: $_('settings.networks.description'),
			link: '/netwrok'
		},
		{
			title: $_('settings.connections.title'),
			description: $_('settings.connections.description'),
			link: '/connections'
		},
		{
			title: $_('settings.security.title'),
			description: $_('settings.security.description'),
			link: '/security'
		},
		{
			title: $_('settings.about.title'),
			description: $_('settings.about.description'),
			link: '/about'
		}
	];
</script>

<section>
	<TopBar />
	<main>
		<ul>
			{#each items as item, i}
				<li
					class:border={i !== items.length - 1}
					on:click={() => push(item.link)}
				>
					<div>
						<h1>
							{item.title}
						</h1>
						<p>
							{item.description}
						</p>
					</div>
					<Arrow />
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
  section {
		background-color: var(--background-color);
		height: fit-content;
		@include flex-center-top-column;
	}
	ul {
		padding: 0;
    margin: 0;
    overflow-y: scroll;
    list-style: none;

		height: calc(100vh - 97px);

		& > li {
			cursor: pointer;
			padding-left: 20px;
			padding-right: 20px;
			color: var(--text-color);
			min-height: 90px;

			@include flex-between-row;

			& > div > h1 {
				margin-block-end: 0.1em;
			}
		}
		& > li.border {
			border-bottom: solid 1px var(--muted-color);
		}
	}
</style>
