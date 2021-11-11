<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { getState } from "popup/backend";
	import { _ } from 'popup/i18n';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import appStore from 'popup/store/apps';
	import { removeConnection } from 'popup/backend/popup';
	import LinkMixin from 'popup/mixins/link';

	import NavClose from '../../components/NavClose.svelte';
	import SearchBox from '../../components/SearchBox.svelte';
	import SvgLoader from '../../components/SvgLoader.svelte';

	let search = '';

	$: connections = $appStore.connections.filter((acc) => {
		const s1 = String(acc.domain).toLowerCase().includes(String(search).toLowerCase());
		const s2 = String(acc.title).toLowerCase().includes(String(search).toLowerCase());
		return s1 || s2;
	});

	const onInputSearch = (e) => {
		search = e.detail;
	};
	const hanldeOnRemove = async (app) => {
		const index = $appStore.connections.findIndex(
			(a) => a.domain === app.domain
		);
		await removeConnection(index);
	};
	const hanldeOnSelect = (app) => {
		LinkMixin.linkToDomain(app.domain);
	};
</script>

<main in:fly={flyTransition.in}>
	<NavClose title={'Connections'}/>
	<SearchBox
		placeholder={$_('accounts.placeholder')}
		focus
		on:input={onInputSearch}
	/>
	<ul>
		{#each connections as item}
			<li class="card">
				<img
					src={item.icon}
					alt="icon"
					on:click={() => hanldeOnSelect(item)}
				/>
				<div on:click={() => hanldeOnSelect(item)}>
					<b>
						{item.domain}
					</b>
					<p>
						{item.title}
					</p>
				</div>
				<div
					class="icon"
					on:click={() => hanldeOnRemove(item)}
				>
					<SvgLoader
						src="/vectors/trash.svg"
						className="trash-icon"
					/>
				</div>
			</li>
		{/each}
	</ul>
</main>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	ul {
		padding: 0;
    margin: 0;
    list-style: none;
		margin-block-start: 16px;

    & > li {
			min-width: 290px;
			height: 60px;

			background-color: var(--card-color);
			border: solid 1px var(--card-color);
			margin: 5px;

			@include flex-between-row;
			@include border-radius(8px);

			& > img {
				cursor: pointer;
				width: 30px;
				margin: 15px;
			}
			& > div {
				cursor: pointer;
				width: 100%;
				&.icon {
					margin: 15px;
					width: 30px;

					&:hover {
						:global(svg.trash-icon > path) {
              fill: var(--primary-color);
            }
					}
				}
				& > b {
					color: var(--text-color);
					font-size: 16px;
					@include text-shorten;
				}
				& > p {
					line-height: 0;
					font-size: 13px;
				}
			}

			&:hover {
				border-color: var(--primary-color);
			}
    }
	}
</style>
