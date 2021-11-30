<script lang="ts">
	import walletStore from 'popup/store/wallet';
  import { trim } from 'popup/filters/trim';
  import { clipboardCopy } from 'lib/utils/clipboard';
	import { _ } from 'popup/i18n';

	import format from 'popup/store/format';

  import Tooltip from './Tooltip.svelte';

  let tip = $_('home.clipboard.copy');
  $: account = $walletStore.identities[$walletStore.selectedAddress];

  const handleOnCopy = () => {
    clipboardCopy(account[$format]);
    tip = $_('home.clipboard.copied');
    setTimeout(() => {
      tip = $_('home.clipboard.copy');
    }, 500);
  };
</script>

<Tooltip
  tip={tip}
  bottom
>
  <div on:click={handleOnCopy}>
    <h1>
      {account.name}
    </h1>
    <p>
      {trim(account[$format])}
    </p>
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
      font-size: clamp(0.8rem, 2vw, 1rem);
    }
    & > p {
      font-size: 9pt;
      color: var(--text-color);
      margin: 0;
    }
    &:hover {
      background-color: var(--hover-color);
    }
  }
</style>
