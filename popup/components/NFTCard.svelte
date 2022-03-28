<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';

  const dispatch = createEventDispatcher();

  export let url;
  export let id;
  export let load;
  
  let loadingSide = true;
  let error = false;
  let thisImage;

  $: tokenId = `#${id}`;
  $: loading = load || loadingSide;

  const onClick = () => {
    dispatch('select');
  };

  onMount(() => {
    thisImage.onload = () => {
      loadingSide = false;
    };
    thisImage.onerror = () => {
      error = true;
      loadingSide = false;
    };
  });
</script>

<div
  class:loading={loading}
  on:click={onClick}
>
  {#if !error}
    <img
      bind:this={thisImage}
      src={url}
      alt={tokenId}
      height="110"
      loading="lazy"
    />
  {/if}
  {#if error}
    <h3>
      {$_('collections.errors.load')}
    </h3>
  {/if}
  <p>
    {tokenId}
  </p>
</div>

<style lang="scss">
  @import "../styles/mixins";

  div {
    cursor: pointer;
    padding: 12px;
    width: fit-content;
    margin: 3px;

    border: solid 2px var(--card-color);
    background-color: var(--card-color);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    @include border-radius(8px);

    & > img,
    & > h3 {
      min-width: 110px;
      max-width: 257px;
      min-height: 110px;
    }

    & > h3 {
      color: var(--danger-color);
    }

    &.loading {
      opacity: 0.5;
      @include loading-gradient(var(--background-color), var(--card-color));
    }
    &:hover {
      border-color: var(--primary-color);
    }
  }
</style>
