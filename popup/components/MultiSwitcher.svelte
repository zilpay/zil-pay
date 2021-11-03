<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let items = [];
  export let selected = 0;

  const hanldeOnSelect = (index: number) => {
    if (selected !== index) {
      dispatch('select', index);
    }
  };
</script>

<ul>
  {#each items as item, i}
    <li
      class:selected={selected === i}
      on:click={() => hanldeOnSelect(i)}
    >
      {item}
    </li>
  {/each}
</ul>

<style lang="scss">
  @import "../styles/mixins";
  ul {
    padding: 0;
    margin: 0;
    list-style: none;

    background-color: var(--card-color);
    border-radius: 8px;

    @include flex-between-row;

    & > li {
      cursor: pointer;

      color: var(--text-color);
      font-family: Demi;
      text-transform: uppercase;
      padding-block-start: 0.4em;
      padding-block-end: 0.4em;

      border-radius: 8px;
      padding-left: 10px;
      padding-right: 10px;
      margin: 5px;

      @include fluid-font(320px, 1024px, 16px, 20px);
    }

    & > li.selected {
      cursor: auto;
      background-color: var(--background-color);
    }
  }
</style>
