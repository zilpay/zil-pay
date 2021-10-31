<script lang="ts">
  import { viewIcon } from 'lib/block-explorer/view';
  import themeStore from 'popup/store/theme';
	import zrcStore from 'popup/store/zrc';

  export let address: string;
  export let balance: string;

  $: token = $zrcStore.find((t) => t.base16 === address);
  $: img = viewIcon(token.bech32, $themeStore);
</script>

<div class="token-card">
  <div>
    <p class="symbol">
      {token.symbol}
    </p>
    <p class="balance">
      {balance}
    </p>
    <p class="conv">
      $300
    </p>
  </div>
  <div class="img-wrapper">
    <img
      src={img}
      alt={token.symbol}
      width="28"
      height="28"
    />
  </div>
</div>

<style type="text/scss">
  @import "../styles/mixins";
  div.token-card {
    cursor: pointer;

    padding: 12px;
    margin: 9px;
    min-width: 142px;
    border-radius: 6px;
    background-color: var(--card-color);
    box-shadow: 0 10px 16px 0 rgb(0 0 0 / 10%), 0 6px 20px 0 rgb(0 0 0 / 19%);

    @include flex-between-row;

    &:hover {
      transition: all 150ms linear;

      opacity: 0.7;
    }
  }
  p.symbol {
    font-size: 16px;
    line-height: 0;
    margin-block-end: 20px;
    font-family: Demi;
  }
  p.balance {
    font-size: 16px;
    line-height: 0px;
    font-family: Bold;
    color: var(--text-color);
    margin-block-end: 15px;
  }
  p.conv {
    font-size: 14px;
    line-height: 5px;
  }
  div.img-wrapper {
    height: 100%;
  }
</style>
