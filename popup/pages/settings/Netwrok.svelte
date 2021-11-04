<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
  import netStore from 'popup/store/netwrok';
  import {
    selectNetwrok,
    changeConfig,
    resetNetwrok,
    updateSSN,
    selectSSN
  } from 'popup/backend/netwrok';
  import ssnStore from 'popup/store/ssn';

	import NavClose from '../../components/NavClose.svelte';
	import MultiSwitcher from '../../components/MultiSwitcher.svelte';
	import Modal from '../../components/Modal.svelte';
	import Loader from '../../components/Loader.svelte';

  let showSSN = false;
  let config = $netStore.config[$netStore.selected];
	let loading = false;

  $: keys = Object.keys($netStore.config);
  $: selected = keys.findIndex((n) => n === $netStore.selected);
  $: disabled = keys[2] !== $netStore.selected;
  $: selectedSSN = $ssnStore.list[$ssnStore.selected];

  const handleOnSelectNet = async (e) => {
    const index = e.detail;
    const net = keys[index];
    await selectNetwrok(net);
  };
  const hanldeOnChangeConfig = async (e) => {
    e.preventDefault();

    try {
      await changeConfig(config);
    } catch (err) {
      console.error(err);
    }
  };
  const handleOnReset = async () => {
    await resetNetwrok();
  };
  const handleOnShowSSNModal = () => {
    showSSN = !showSSN;
  };
  const hanldeUpdateSSN = async () => {
    loading = true;
    try {
      await updateSSN();
    } catch (err) {
      console.error(err);
    }
    loading = false;
  };
  const handleOnSelectSSN = async (index: number) => {
    loading = true;
    try {
      await selectSSN(index);
      showSSN = false;
    } catch (err) {
      console.error(err);
    }
    loading = false;
  };
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <NavClose title={$_('netwrok.title')}/>
  <MultiSwitcher
    items={Object.keys($netStore.config)}
    selected={selected}
    on:select={handleOnSelectNet}
  />
  {#if $netStore.selected === keys[0]}
    <button
      class="secondary ssn"
      on:click={handleOnShowSSNModal}
    >
      {selectedSSN.name}
    </button>
  {/if}
  <form on:submit={hanldeOnChangeConfig}>
    <label>
      {$_('netwrok.config.node')}
			<input
        bind:value={config.PROVIDER}
        disabled={disabled}
        type="url"
      >
		</label>
    <label>
      {$_('netwrok.config.msg')}
			<input
        bind:value={config.MSG_VERSION}
        disabled={disabled}
        type="number"
      >
		</label>
    <button
      disabled={disabled}
      class="primary"
    >
      {$_('netwrok.btns.update')}
		</button>
  </form>
  <button
    class="secondary reset"
    on:click={handleOnReset}
  >
    {$_('netwrok.btns.reset')}
  </button>
</main>

<Modal
  show={showSSN}
  on:close={handleOnShowSSNModal}
>
  <div class="modal-wrapper">
    <ul>
      {#each $ssnStore.list as ssn, i}
        <li
          class:border={i !== $ssnStore.list.length - 1}
          on:click={() => handleOnSelectSSN(i)}
        >
          <span>
            {ssn.name}
          </span>
          <span>
            {Number(ssn.time).toFixed()} ms
          </span>
        </li>
      {/each}
    </ul>
    <button
      class="primary"
      disabled={loading}
      on:click={hanldeUpdateSSN}
    >
      {#if loading}
        <span>
          <Loader
            width="25px"
            height="25px"
          />
        </span>
      {:else}
        {$_('netwrok.btns.update')}
      {/if}
    </button>
  </div>
</Modal>

<style lang="scss">
  @import "../../styles/mixins";
  main {
		background-color: var(--background-color);

		@include flex-center-top-column;
  }
  label {
    @include fluid-font(320px, 600px, 10px, 12px);
    @include flex-column;

    font-family: Regular;
    color: var(--muted-color);

    & > input {
      min-width: 290px;
    }
  }
  button {
    min-width: 290px;

    &.ssn {
      margin-top: 15px;
    }

    &.reset {
      margin-block-start: 30px;
    }
  }
  form {
    width: 100%;
    margin-top: 30px;
    @include flex-center-column;

    & > input, button {
      max-width: 290px;
      margin: 10px;
    }
  }
  div.modal-wrapper {
    padding: 17px;
    @include flex-center-column;

    & > ul {
      padding: 0;
      list-style: none;

      & > li {
        cursor: pointer;
        padding: 10px;
        @include flex-between-row;
        @include fluid-font(320px, 600px, 18px, 22px);

        color: var(--text-color);
        font-family: Regular;

        &.border {
          border-bottom: solid 1px;
        }
        & > span {
          @include text-shorten;
          margin-left: 10px;
          margin-right: 10px;
        }
        &:hover {
          color: var(--muted-color);
        }
      }
    }
  }
</style>
