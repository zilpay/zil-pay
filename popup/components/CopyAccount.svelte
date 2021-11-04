<script lang="ts">
	import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';
  import { clipboardCopy } from 'lib/utils/clipboard';
	import { _ } from 'popup/i18n';

  import Tooltip from './Tooltip.svelte';

  let tip = $_('home.clipboard.copy');
  $: account = $walletStore.identities[$walletStore.selectedAddress];

  const handleOnCopy = () => {
    clipboardCopy(account.bech32);
    tip = $_('home.clipboard.copied');
    setTimeout(() => {
      tip = $_('home.clipboard.copy');
    }, 500);
  };
</script>

<Tooltip tip={tip} bottom>
  <div on:click={handleOnCopy}>
    <h1>
      {account.name}
    </h1>
    <span>
      {trim(account.bech32)}
    </span>
  </div>
</Tooltip>

<style lang="scss">
  @import "../styles/mixins";
  div {
    text-align: center;
    cursor: pointer;

    padding: 8px;
    margin: 5px;
    border-radius: 8px;

    & > h1 {
      margin-block-start: 0;
      margin-block-end: 0.2em;
    }

    & > span {
      color: var(--text-color);
    }

    &:hover {
      background-color: var(--hover-color);
    }
  }
</style>
