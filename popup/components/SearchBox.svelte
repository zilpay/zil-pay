<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { blur } from 'svelte/transition';

  import SearchIcon from './icons/Search.svelte';

  const dispatch = createEventDispatcher();

	let inputEl;

  export let focus = false;
  export let placeholder = '';

  onMount(() => {
    if (focus && inputEl && inputEl.focus) {
      inputEl.focus();
    }
  });

  const onInput = (e) => {
    const { value } = e.target;
    dispatch('input', value);
  };
</script>

<div
  in:blur
  class="search-box"
>
  <div>
    <SearchIcon />
  </div>
  <input
    bind:this={inputEl}
    placeholder={placeholder}
    type="search"
    on:input={onInput}
  >
  {#if $$slots.default}
    <slot />
	{/if}
</div>

<style lang="scss">
  @import "../styles";

  div.search-box {
    background: var(--card-color);
    border: solid 1px var(--card-color);

    width: 280px;
    // width: calc(100vw - 30px);
    @include border-radius($default-border-radius);
    @include flex-center-vert;

    & > input {
      margin: 0;
      padding: 0;
      padding-left: 0;
      border-color: var(--card-color);
    }
    & > div {
      margin: 10px;
    }
    &:focus-within {
      border: solid 1px var(--text-color);
    }
  }
</style>
