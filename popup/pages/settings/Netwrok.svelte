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
    config = $netStore.config[$netStore.selected];
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
</main>

<style lang="scss">
  @import "../../styles/mixins";
  main {
		background-color: var(--background-color);

		@include flex-center-top-column;
  }
</style>
