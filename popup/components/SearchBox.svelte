<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  import SvgLoader from './SvgLoader.svelte';

  const dispatch = createEventDispatcher();

	let inputEl;

  export let focus = false;

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

<label>
  <div>
    <SvgLoader src="/vectors/search.svg" />
  </div>
  <input
    bind:this={inputEl}
    on:input={onInput}
  >
</label>

<style lang="scss">
  @import "../styles/mixins";

  label {
    background: var(--card-color);
    border-radius: 8px;

    max-width: 360px;
    width: calc(100vw - 25px);

    @include flex-center-vert;

    & > input {
      padding-left: 0;
    }

    & > div {
      margin: 10px;

      & > svg {
        width: 24px;
        height: 24px;
        & > path {
          fill: var(--muted-color);
        }
      }
    }
  }
</style>
