<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';
  import { AccountTypes } from 'config/account-type';

	import walletStore from 'popup/store/wallet';

  import Close from './Close.svelte';
	import TextElement from './TextElement.svelte';

  const dispatch = createEventDispatcher();

  export let show = false;

	$: account = $walletStore.identities[$walletStore.selectedAddress];
  $: canRemove = account.index !== 0 && account.type !== AccountTypes.seed;

  const onClose = () => {
    dispatch('close');
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
  <a href="/">
    <TextElement
      title={$_('home.nav.optinos.add.title')}
      description={$_('home.nav.optinos.add.description')}
    />
  </a>
  <a href="/">
    <TextElement
      title={$_('home.nav.optinos.import.title')}
      description={$_('home.nav.optinos.import.description')}
    />
  </a>
  <a href="/">
    <TextElement
      title={$_('home.nav.optinos.connect.title')}
      description={$_('home.nav.optinos.connect.description')}
    />
  </a>
  <hr />
  {#if canRemove}
    <a href="/">
      <TextElement
        title={$_('home.nav.optinos.remove.title')}
        description={$_('home.nav.optinos.remove.description')}
      />
    </a>
  {/if}
</nav>
<div
  class:show={show}
  on:click={onClose}
/>

<style lang="scss">
  @import "../styles/mixins";
  :global(span.close:hover > svg > line) {
    stroke: var(--primary-color) !important;
	}
  div {
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

    animation: backInLeft 0.4s;
    animation-timing-function: cubic-bezier(.3,.17,.23,.96);
  }
  @keyframes backInLeft {
    0% {
      transform: translateX(-2000px);
      opacity: 0.7;
    }

    80% {
      transform: translateX(0px);
      opacity: 0.7;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
