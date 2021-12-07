<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { fade } from 'svelte/transition';

	import { _ } from 'popup/i18n';
	import { removeConnection, clearConnection } from 'popup/backend/popup';
	import LinkMixin from 'popup/mixins/link';

	import appStore from 'popup/store/apps';

	import NavClose from '../../components/NavClose.svelte';
	import SearchBox from '../../components/SearchBox.svelte';
	import TrashIcon from '../../components/icons/Trash.svelte';

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

<section>
	<main in:fade>
		<NavClose title={$_('connections.title')}/>
		<SearchBox
			placeholder={$_('accounts.placeholder')}
			focus
			on:input={onInputSearch}
		/>
		<ul>
			{#if $appStore.connections.length === 0}
				<p>
					{$_('connections.no_apps')}
				</p>
			{/if}
			{#each connections as item}
				<li class="card">
					<img
						src={item.icon}
						alt="icon"
						width="30"
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
						<TrashIcon className="trash-icon" />
					</div>
				</li>
			{/each}
		</ul>
		<div>
			{#if $appStore.connections.length !== 0}
				<button on:click={clearConnection}>
					{$_('connections.btn_reset')}
				</button>
			{/if}
		</div>
	</main>
</section>

<style lang="scss">
	@import "../../styles/mixins";

	main {
		max-width: 520px;
		min-width: 300px;
		width: calc(100vw - 15px);
		height: calc(100vh - 15px);
	
		@include flex-center-top-column;
	}
	section {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
	button {
		width: 290px;
	}
	ul {
		padding: 0;
    margin: 0;

    overflow-y: scroll;

		margin-block-start: 16px;
		height: 100%;

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
