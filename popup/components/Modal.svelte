<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let title = '';
  export let show: boolean;

  let node = null;
  const onToggle = (e) => {
    if (e.target == node) {
      dispatch('close');
    }
  };
</script>

<aside
  bind:this={node}
  class:show={show}
  on:click={onToggle}
>
  <div class="modal">
    {title}
    <div>
      <slot />
    </div>
  </div>
</aside>

<style lang="scss">
  @import "../styles/mixins";
  aside {
    position: fixed;
    display: none;
    overflow: auto;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 50;

    &.show {
      display: block;
      background: rgb(0 0 0 / 59%);

      & > div.modal {
        right: 0;
        left: 0;
        margin: 10% auto 50px;
        max-width: 400px;
        width: 100%;
        background: var(--background-color);
        padding: 0;
        z-index: 100;
        border-radius: 8px;
        // box-shadow: 0 0 8px var(--border-color);
      }
    }
  }
</style>
