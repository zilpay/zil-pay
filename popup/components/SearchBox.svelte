<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  import SvgLoader from './SvgLoader.svelte';

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

<label class="search-box">
  <div>
    <SvgLoader src="/vectors/search.svg" />
  </div>
  <input
    bind:this={inputEl}
    placeholder={placeholder}
    type="search"
    on:input={onInput}
  >
</label>

<style lang="scss">
  @import "../styles/mixins";

  label.search-box {
    background: var(--card-color);
    border: solid 1px var(--card-color);

    max-width: 300px;
    width: 100%;
    @include border-radius(8px);
    @include flex-center-vert;

    & > input {
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
