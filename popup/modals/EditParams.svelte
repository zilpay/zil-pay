<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'popup/i18n';

  const dispatch = createEventDispatcher();

  export let tx = {
    gasLimit: 0,
    gasPrice: 0,
    nonce: 0,
    data: ''
  };
  let selected = 0;
  let tabs = [
    'Gas',
    'Data'
  ];
  let data = '';

  function handleSubmitGas(e) {
		e.preventDefault();

		try {
      dispatch('update', tx);
		} catch (err) {
      console.log(err);
		}
	}

  function handleSubmitData(e) {
		e.preventDefault();

    try {
      const newData = JSON.parse(data);

      tx.data = JSON.stringify(newData);

      dispatch('update', tx);
    } catch (err) {
      console.log(err);
    }
  }

  onMount(() => {
    try {
      data = JSON.stringify(JSON.parse(tx.data), null, 2);
    } catch {
      ///
    }
  });
</script>

<div class="wrapper">
  {#if data}
    <ul class="tabs">
      {#each tabs as item, index}
        <li
          class:selected={selected === index}
          on:click={() => selected = index}
        >
          {item}
        </li>
      {/each}
    </ul>
  {/if}
  {#if selected === 0}
    <form on:submit={handleSubmitGas}>
      <label>
        <p>
          {$_('confirm.parmas_modal.price')}
        </p>
        <input
          bind:value={tx.gasPrice}
          type="number"
        />
      </label>
      <label>
        <p>
          {$_('confirm.parmas_modal.limit')}
        </p>
        <input
          bind:value={tx.gasLimit}
          type="number"
        />
      </label>
      <label>
        <p>
          {$_('confirm.params.nonce')}
        </p>
        <input
          bind:value={tx.nonce}
          min="0"
          type="number"
        />
      </label>
      <button class="primary">
        {$_('confirm.parmas_modal.btn')}
      </button>
    </form>
  {/if}
  {#if selected === 1}
    <form on:submit={handleSubmitData}>
      <textarea bind:value={data}/>
      <button class="primary">
        {$_('confirm.parmas_modal.btn')}
      </button>
    </form>
  {/if}
</div>

<style lang="scss">
	@import "../styles/mixins";
  input,
  button {
    width: 290px;
  }
  div.wrapper {
		height: 600px;
  }
  textarea {
    max-width: 470px;
    margin: 22px;
    font-size: 9pt;
    line-height: 0.9em;
    min-height: 353px;
  }
  ul.tabs {
    margin: 0;
    padding: 0;

    box-shadow: rgba(60, 64, 67, 0.3) 0 4px 2px -2px;

    @include flex-center;

    & > li {
      cursor: pointer;
      padding: 10px;

      color: var(--text-color);
      font-size: 16pt;
      text-align: center;

      width: 100%;
      border-bottom: solid 2px transparent;

      &.selected {
        border-bottom: solid 2px var(--primary-color);
      }
    }
  }
  form {
    width: 100%;

    @include flex-center-top-column;

    & > button {
      margin-block-start: 10px;
    }
  }
</style>
