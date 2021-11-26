<script lang="ts">
	import { _ } from 'popup/i18n';
  import {
    selectNetwrok,
    changeConfig,
    resetNetwrok,
    updateSSN,
    selectSSN
  } from 'popup/backend/netwrok';

  import ssnStore from 'popup/store/ssn';
  import netStore from 'popup/store/netwrok';

	import NavClose from '../../components/NavClose.svelte';
	import Modal from '../../components/Modal.svelte';
  import Jumbotron from '../../components/Jumbotron.svelte';

  let showSSN = false;
  let config = $netStore.config[$netStore.selected];
	let loading = false;

  $: keys = Object.keys($netStore.config);
  $: disabled = keys[2] !== $netStore.selected;
  $: selectedSSN = $ssnStore.list[$ssnStore.selected];

  const handleOnSelectNet = async (e) => {
    const net = e.target.value;
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
    config = $netStore.config[$netStore.selected];
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
  const handleOnSelectSSN = async (e) => {
    const index = Number(e.target.value);
    loading = true;
    try {
      await selectSSN(index);
      config = $netStore.config[$netStore.selected];
      showSSN = false;
    } catch (err) {
      console.error(err);
    }
    loading = false;
  };
</script>

<main>
  <NavClose title={$_('netwrok.title')}/>
  <div>
    <Jumbotron
			title={$_('netwrok.selected.title')}
			description={$_('netwrok.selected.description')}
		>
			<select on:input={handleOnSelectNet}>
				{#each keys as net}
					<option
						value={net}
						selected={net === $netStore.selected}
					>
						{net}
					</option>
				{/each}
			</select>
		</Jumbotron>
    <Jumbotron
      title={$_('netwrok.node.title')}
      description={$_('netwrok.node.description')}
    >
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
    </Jumbotron>
    {#if $netStore.selected === keys[0]}
      <Jumbotron
        title={$_('netwrok.ssn.title')}
        description={$_('netwrok.ssn.description')}
      >
        <div class="ssn-list">
          <select on:input={handleOnSelectSSN}>
            {#each $ssnStore.list as ssn, index}
              <option
                value={index}
                selected={index === $ssnStore.selected}
              >
                {ssn.name} ({Number(ssn.time).toFixed()} ms)
              </option>
            {/each}
          </select>
          <button
            disabled={loading}
            class="primary"
            class:loading={loading}
            on:click={hanldeUpdateSSN}
          >
            {$_('netwrok.btns.update')}
          </button>
        </div>
      </Jumbotron>
    {/if}
  </div>
  <button
    class="warning"
    on:click={handleOnReset}
  >
    {$_('netwrok.btns.reset')}
  </button>
</main>

<style lang="scss">
  @import "../../styles/mixins";
  main {
		background-color: var(--background-color);
    overflow-y: scroll;
    height: 100vh;

		@include flex-center-top-column;
  }
  button {
    width: 290px;
    margin: 10px;
  }
  div.ssn-list {
		@include flex-center-top-column;
  }
  label {
    width: 100%;
    font-size: 10px;
    margin-block-start: 10px;

    font-family: Regular;
    color: var(--muted-color);
    @include flex-column;

    & > input {
      min-width: 290px;
      margin-block-start: 5px;
      border-color: var(--muted-color);
    }
  }
  form {
    width: 100%;

    @include flex-center-column;
  }
</style>
