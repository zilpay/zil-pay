<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';

  import themeStore from 'popup/store/theme';
  import { viewIcon } from 'lib/block-explorer/view';

	import NFTCard from '../components/NFTCard.svelte';
	import Toggle from '../components/Toggle.svelte';

  const dispatch = createEventDispatcher();

	export let tokens = [];
  export let loading = false;
  export let toggle = false;
  export let bottom = false;

  const handleOnRemove = (index) => {
    dispatch('remove', index);
  };
  const handleOnSelect = (index, tokenIndex) => {
    dispatch('select', {
      index,
      tokenIndex
    });
  };
</script>

<ul class:bottom={bottom}>
  {#if tokens.length === 0}
    <p>
      {$_('collections.no_tokens')}
    </p>
  {/if}
  {#each tokens as item, index}
    <li>
      <div class="header">
        <div>
          <img
            height="30"
            src={viewIcon(item.bech32, $themeStore)}
            alt="logo"
          />
          <h3>
            {item.name} ({item.symbol})
          </h3>
        </div>
        {#if toggle}
          <Toggle
            checked={item}
            on:toggle={() => handleOnRemove(index)}
          />
        {/if}
      </div>
      <div class="wrapper">
        {#if item.balances.length === 0}
          <p>
            {$_('collections.empty.0')} ({item.symbol}) {$_('collections.empty.1')}
          </p>
        {/if}
        {#each item.balances as token, tokenIndex}
          <NFTCard
            url={Boolean(token.meta) ? token.meta.image : token.url}
            load={loading}
            id={token.id}
            on:select={() => handleOnSelect(index, tokenIndex)}
          />
        {/each}
      </div>
    </li>
  {/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
  p {
		text-align: left;
    width: 280px;
	}

  ul {
		margin: 0;
		padding: 0;
    overflow-y: scroll;
		
		margin-block-start: 15px;


    &.bottom {
      height: calc(100vh - 182px);
    }

		@include flex-center-top-column;

		& > li {
			width: calc(100vw - 30px);
			max-width: 450px;
			margin-block-start: 5px;
			margin-block-end: 5px;

			@include flex-column;

			& > .header {
				@include flex-between-row;

				& > div {
					@include flex-between-row;
					& > h3 {
						text-indent: 10px;
					}
				}
			}
			& > .wrapper {
				flex-wrap: wrap;

				@include flex-between-row;
			}
		}
	}
</style>
