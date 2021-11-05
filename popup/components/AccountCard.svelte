<script lang="ts">
  import { trim } from 'popup/filters/trim';

  export let account = {
    name: '',
    bech32: ''
  };
  export let selected = false;
</script>

<div class="wrapper">
  <div
    class="radio"
    class:selected={selected}
  >
    {#if selected}
      <span />
    {/if}
  </div>
  <div>
    <h2>
      {account.name}
    </h2>
    <p>
      {trim(account.bech32)}
    </p>
  </div>
</div>
<div>
  <h2>
    {0} ZIL
  </h2>
  <p>
    ${0}
  </p>
</div>

<style lang="scss">
	@import "../styles/mixins";
	h2 {
		color: var(--text-color);
		margin-block-end: 0;
		margin-block-start: 0.8em;
    font-size: 16px;

    @include text-shorten;
	}
  p {
    color: var(--muted-color);
		margin-block-end: 0.8;
		margin-block-start: 0em;
    font-size: 10px;
  }
  div.radio {
    width: 20px;
    height: 20px;
    background: var(--background-color);
    border: solid 3px var(--background-color);
    border-radius: 100%;
    margin-right: 15px;

    &.selected {
      border: solid 3px var(--background-color);
      background: var(--primary-color);
    }
  }
  div.wrapper {
    @include flex-between-row;
  }
</style>
