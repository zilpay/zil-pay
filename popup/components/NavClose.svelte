<script lang="ts">
	import { pop } from 'svelte-spa-router';
	import CloseIcon from './Close.svelte';

  export let title: string;
</script>

<nav>
  <h1>
    {title}
  </h1>
  <a on:click={pop}>
    <CloseIcon />
  </a>
</nav>

<style type="text/scss">
  @import "../styles/mixins";
  h1 {
    @include fluid-font(320px, 720px, 30px, 55px);
  }
  nav {
    @include flex-between-row;
    max-width: 900px;
    width: calc(100vw - 30px);
    align-items: center;
  }
</style>
