<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
  import netStore from 'popup/store/netwrok';
  import { selectNetwrok, changeConfig, resetNetwrok } from 'popup/backend/netwrok';
  import ssnStore from 'popup/store/ssn';

	import NavClose from '../../components/NavClose.svelte';
	import MultiSwitcher from '../../components/MultiSwitcher.svelte';

  let config = $netStore.config[$netStore.selected];

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
  <button class="secondary ssn">
    {selectedSSN.name}
  </button>
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
</style>
