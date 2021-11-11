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
    <div class="title">
      <h1>{title}</h1>
    </div>
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
        max-width: 500px;
        width: 100%;
        background: var(--background-color);
        padding: 0;
        z-index: 100;

        & > div.title {
          padding-top: 10px;
          padding-left: 10px;
          font-size: 26px;

          @include fluid-font(320px, 720px, 16px, 22px);
        }

        @media screen and (min-width: 899px) {
          margin: 10% auto 50px;
          @include border-radius(8px);
        }
      }
    }
  }
</style>
