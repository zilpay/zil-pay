<script lang="ts">
  import { link } from 'svelte-spa-router';
  import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';

  $: account = $walletStore.identities[$walletStore.selectedAddress];
</script>

<nav>
  <a
    class="netwrok"
    href="/netwrok"
    use:link
  />
</nav>

<style lang="scss">
  @import "../styles/mixins";
  nav {
    max-width: 900px;
    height: 36px;
    width: 100%;
    background-color: var(--card-color);
    z-index: 2;

    @include flex-between-row;

    @media screen and (min-width: 899px) {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
  a.netwrok {
    height: 15px;
    width: 15px;

    margin: 11px;

    border-radius: 100%;
    background-color: var(--primary-color);
  }
</style>
