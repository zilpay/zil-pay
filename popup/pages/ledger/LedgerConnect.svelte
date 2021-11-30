<script lang="ts">
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';
  import { AccountTypes } from 'config/account-type';
	import flyTransition from 'popup/transitions/fly';
  import {
    MAX_NAME_LEN,
    MIN_NAME_LEN,
    DEFAULT_LEDGER_NAME
  } from 'popup/config/account';
  import { LEDGER_USB_VENDOR_ID, LEDGER_PRODUCT_ID_U2F } from 'config/ledger';

	import walletStore from 'popup/store/wallet';

	import { balanceUpdate } from 'popup/backend/wallet';
  import { loadLedgerAccount } from 'popup/backend/ledger';

  import BackBar from '../../components/BackBar.svelte';

  export let params = {
    id: 0
  };

  let lastIndex = $walletStore
    .identities
    .filter((acc) => {
      const t0 = acc.type === AccountTypes.Ledger;
      const t1 = acc.productId === Number(params.id);

      return t0 && t1;
    })
    .length;
  let error = '';
  let name = `${DEFAULT_LEDGER_NAME} ${lastIndex}`;
  let index = lastIndex;
	let loading = false;
  let device;

  $: disabled = loading || name.length < MIN_NAME_LEN;
  $: isU2f = Number(params.id) === LEDGER_PRODUCT_ID_U2F;

  onMount(async () => {
    if (!window.navigator.hid) {
      return;
    }
    const devices = await window.navigator.hid.getDevices({
      filters: [{
        productId: Number(params.id),
        vendorId: LEDGER_USB_VENDOR_ID
      }]
    });
    device = devices.filter((d) => d.productId === Number(params.id))[0];

    if (!device) {
      push('/ledger-device-finder');
    }

    name = `${device.productName} ${lastIndex}`;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    loading = true;

    try {
      await loadLedgerAccount(index, Number(params.id), name);

      push('/');
    } catch (err) {
      error = err.message;
    }
    loading = false;
  };
</script>

<main>
	<BackBar
    length={2}
    selected={1}
  />
  <h1>
    {$_('ledger.title')}
  </h1>
  <h2>
    {error}
  </h2>
  <form
    in:fly={flyTransition.in}
    on:submit={handleSubmit}
  >
    <label>
			<input
				bind:value={name}
        maxlength={MAX_NAME_LEN}
        minlength={MIN_NAME_LEN}
				placeholder={$_('setup_acc.name_placeholder')}
        required
			>
			<p>
				{$_('setup_acc.name_description')}
      </p>
		</label>
    <label>
			<input
				bind:value={index}
        type="number"
        max={256}
        min={0}
				placeholder={$_('ledger.placeholder')}
        required
        on:input={() => error = ''}
			>
			<p>
				{$_('ledger.info')}
      </p>
		</label>
    <button
      class="primary"
      class:loading={loading}
      disabled={disabled}
    >
      {$_('ledger.btn')}
    </button>
  </form>
</main>

<style lang="scss">
	@import "../../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
  h1 {
    @include fluid-font(320px, 1024px, 22px, 55px);
  }
  h2 {
    color: var(--danger-color);
    @include fluid-font(320px, 1024px, 17px, 22px);
  }
  form {
    width: 100%;
    @include flex-center-column;

    & > label > p {
      margin-left: 10px;
    }

    & > label, button {
      width: 100%;
      max-width: 290px;
      margin: 5px;
    }
  }
</style>
