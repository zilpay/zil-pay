<script lang="ts">
  import { createEventDispatcher } from 'svelte';
	import { _ } from 'popup/i18n';

  import SvgLoader from './SvgLoader.svelte';

  const dispatch = createEventDispatcher();

  export let show = false;

  const onClose = () => {
    dispatch('close');
  };
</script>

<nav class:show={show}>
  <h1>
    {$_('home.nav.title')}
    <span
      class="close"
      on:click={onClose}
    >
      <SvgLoader src="/vectors/close.svg" />
    </span>
  </h1>
  <hr />
  <a href="/">
    {$_('home.nav.optinos.add')}
  </a>
  <a href="/">
    {$_('home.nav.optinos.import')}
  </a>
  <a href="/">
    {$_('home.nav.optinos.connect')}
  </a>
  <hr />
  <a href="/">
    {$_('home.nav.optinos.remove')}
  </a>
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
    min-width: 220px;
    width: fit-content;
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
  a {
    color: var(--text-color);
    font-family: Demi;
    line-height: 20px;

    font-size: 16px;
    line-height: 25px;

    &:hover {
      color: var(--primary-color);
    }
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
