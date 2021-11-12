<script lang="ts">
	import Arrow from './icons/Arrow.svelte';

  let show = false;
</script>

<div>
  <div
    class="arrow"
    on:click={() => show = !show}
  >
    <Arrow className="arrow-icon"/>
  </div>
  {#if show}
    <div class="close"/>
    <div class="menu">
      <span
        class="close-arrow-icon"
        on:click={() => show = false}
      >
        <Arrow/>
      </span>
      <div>Remove</div>
      <div>Copy address</div>
    </div>
  {/if}
</div>

<style lang="scss">
  @import "../styles/mixins";
  div.arrow {
    cursor: pointer;
    margin: 10px;
    transform: rotate(90deg);

    :global(svg.arrow-icon > path) {
      fill: var(--text-color);
    }

    &:hover {
      :global(svg.arrow-icon > path) {
        fill: var(--primary-color);
      }
    }
  }
  div.close {
    cursor: pointer;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(3px);
  }
  span.close-arrow-icon {
    cursor: pointer;
    transform: rotate(-90deg);
  }
  div.menu {
    position: absolute;
    background-color: var(--card-color);
    transform: translate(-35%, -56%);
    padding: 5px;

    align-items: flex-end;
    @include flex-column;
    @include border-radius(8px);
  }
</style>
