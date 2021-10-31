<script lang="ts">
  import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';

  import Burger from './Burger.svelte';

  $: account = $walletStore.identities[$walletStore.selectedAddress];
</script>

<nav>
  <Burger />
  <div class="account">
    <span>
      {account.name}
    </span>
    <span>
      ({trim(account.bech32)})
    </span>
  </div>
  <span class="netwrok"/>
</nav>

<style type="text/scss">
  @import "../styles/mixins";
  nav {
    max-width: 600px;
    height: 36px;
    width: 100%;
    background-color: var(--card-color);

    @include flex-between-row;
  }
  div.account {
    font-family: Demi;
    color: var(--text-color);

    & > :last-child {
      color: var(--muted-color);
    }
  }
  span.netwrok {
    height: 36px;
    width: 36px;
  }
</style>
