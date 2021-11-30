<script lang="ts">
  import { Gas } from 'config/gas';
  import { createEventDispatcher } from 'svelte';
	import { QA } from 'popup/config/gas';

  import Speed from './icons/Speed.svelte';

  const dispatch = createEventDispatcher();

  export let multiplier = 1;
  export let gasPrice = Gas.gasPrice;
  export let gasLimit = Gas.gasLimit;

  $: zil = gasPrice * gasLimit;
  $: list = Array(3);

  const handleOnSelect = (index: number) => {
    dispatch('select', index + 1);
  };
</script>

<ul>
  {#each list as item, index}
    <li
      class:selected={(index + 1) === multiplier}
      on:click={() => handleOnSelect(index)}
    >
      <Speed length={index + 1}/>
      <h3>
        {(zil * (index + 1)) / QA} ZIL
      </h3>
    </li>
  {/each}
</ul>

<style lang="scss">
	@import "../styles/mixins";
  ul {
		padding: 0px;
    margin: 0;
    background-color: var(--card-color);

    @include flex-between-row;
    @include border-radius(8px);

    & > li {
      cursor: pointer;

      margin: 5px;
      padding: 8px;
      min-width: 90px;
      min-height: 40px;
      text-align: center;

      @include border-radius(8px);
      @include flex-center-column;

      &.selected {
        background-color: var(--background-color);
      }
      & > h3 {
        @include fluid-font(320px, 1024px, 13px, 15px);
        margin: 0;
      }
    }
  }
</style>
