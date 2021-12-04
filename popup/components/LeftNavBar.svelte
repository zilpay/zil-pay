<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { link } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import { Formats } from 'config/formats';
  import { AccountTypes } from 'config/account-type';

  import { linksExpand } from 'popup/mixins/link';

	import { removeAccount } from 'popup/backend/wallet';
  import {
		changeAddressFormat,
		changePromtEnabled,
    setPhishingDetection
	} from 'popup/backend/settings';

	import walletStore from 'popup/store/wallet';
	import promtStore from 'app/store/promt';
	import addressFormatStore from 'popup/store/format';
	import phishingStore from 'app/store/phishing';

  import Close from './Close.svelte';
	import TextElement from './TextElement.svelte';
  import Toggle from '../components/Toggle.svelte';

  const dispatch = createEventDispatcher();

  export let show = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];
  $: canRemove = !(account.index === 0 && account.type === AccountTypes.Seed);

  const onClose = () => {
    dispatch('close');
  };
  const onRemoveAccount = async () => {
    await removeAccount();
    onClose();
  };
  const handleToggleAddressFormat = async () => {
		if ($addressFormatStore === Formats.Base16) {
			await changeAddressFormat(Formats.Bech32);
		} else {
			await changeAddressFormat(Formats.Base16);
		}
	};
</script>

<nav class:show={show}>
  <h1>
    {account.name}
    <span on:click={onClose}>
      <Close />
    </span>
  </h1>
  <hr />
  <a href="/add-account" use:link>
    <TextElement
      title={$_('home.nav.optinos.add.title')}
      description={$_('home.nav.optinos.add.description')}
    />
  </a>
  <a href="/import-privkey" use:link>
    <TextElement
      title={$_('home.nav.optinos.import.title')}
      description={$_('home.nav.optinos.import.description')}
    />
  </a>
  <span on:click={() => linksExpand('/ledger-device-finder')}>
    <TextElement
      title={$_('home.nav.optinos.connect.title')}
      description={$_('home.nav.optinos.connect.description')}
    />
  </span>
  <hr />
  {#if canRemove}
    <span
      class="remove"
      on:click={onRemoveAccount}
    >
      <TextElement
        title={$_('home.nav.optinos.remove.title')}
        description={$_('home.nav.optinos.remove.description')}
      />
    </span>
    <hr />
  {/if}
  <div class="toggles">
    <div>
      <b>
        {$_('advanced.popup.title')}
      </b>
      <Toggle
        checked={$promtStore}
        on:toggle={() => changePromtEnabled(!$promtStore)}
      />
    </div>
    <div>
      <b>
        {$_('advanced.base16.title')}
      </b>
      <Toggle
        checked={$addressFormatStore === Formats.Base16}
        on:toggle={handleToggleAddressFormat}
      />
    </div>
    <div>
      <b>
        {$_('security.phishing.title')}
      </b>
      <Toggle
        checked={$phishingStore}
        on:toggle={() => setPhishingDetection(!$phishingStore)}
      />
    </div>
  </div>
</nav>
<div
  class="close"
  class:show={show}
  on:click={onClose}
/>

<style lang="scss">
  @import "../styles/mixins";
  :global(span.close:hover > svg > line) {
    stroke: var(--primary-color) !important;
	}
  div.toggles {
    width: 100%;

    @include flex-column;
    align-items: flex-end;

    & > div {
      padding-left: 15px;
      padding-right: 15px;
      margin-block-end: 5px;

      @include flex-right-horiz;
      align-items: center;

      & > b {
        margin: 8px;
      }
    }
  }
  div.close {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    z-index: 4;

    display: none;
    backdrop-filter: blur(3px);
    cursor: pointer;
    background-color: #0000008f;

    &.show {
      display: block;
    }
  }
  h1 {
    margin-block-end: 0;
    font-size: 15pt;
    @include flex-between-row;

    & > span {
      cursor: pointer;
      margin-right: 15px;
    }
  }
  nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;

    padding-left: 15px;

    display: none;
    min-width: 270px;
    max-width: 400px;
    width: calc(100vw - 30px);
    height: 100vh;
    z-index: 5;

    background-color: var(--background-color);

    @include border-right-radius(16px);

    &.show {
      @include flex-left-column;
    }
    animation: back-in-left 0.4s;
    animation-timing-function: cubic-bezier(.3,.17,.23,.96);
  }
  span {
    cursor: pointer;
  }
</style>
