<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';

  import { trim } from 'popup/filters/trim';
  import { fromDecimals } from 'popup/filters/units';
  import { viewIcon } from 'lib/block-explorer/view';
	import { jazziconCreate } from 'popup/mixins/jazzicon';
  import { formatNumber } from 'popup/filters/n-format';
  import { convertRate } from 'popup/filters/convert-rate';

  import zrcStore from 'app/store/zrc';
	import walletStore from 'popup/store/wallet';
  import rateStore from 'popup/store/rate';
  import themeStore from 'popup/store/theme';
	import currencyStore from 'popup/store/currency';

	import { balanceUpdate } from 'popup/backend/wallet';

	import NavClose from '../components/NavClose.svelte';
  import SelectCard from '../components/SelectCard.svelte';

  let selectedAccount = $walletStore.selectedAddress;
  let selectedToken = 0;

	$: account = $walletStore.identities[selectedAccount];

  $: token = $zrcStore[selectedToken];
  $: tokenIcon = viewIcon(token.bech32, $themeStore);

  $: balance = fromDecimals(account.zrc2[token.base16], token.decimals).round(7);
	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, balance).round(7);

  onMount(() => {
		jazziconCreate('jazzicon', account.base16);
  });
</script>

<main>
	<NavClose title={$_('send.title')}/>
  <div in:fly={flyTransition.in}>
    <div class="card-wrapper">
      <SelectCard
        title={$_('send.cards.transfer')}
        header={account.name}
        text={trim(account.bech32)}
      >
        <div id="jazzicon"/>
      </SelectCard>
      <hr />
      <SelectCard
        title={$_('send.cards.token')}
        header={token.symbol}
        text={token.name}
        rightHeader={formatNumber(balance)}
        rightText={formatNumber(converted, $currencyStore)}
      >
        <img
          src={tokenIcon}
          alt={token.symbol}
          width="36"
        />
      </SelectCard>
    </div>
    <div>

    </div>
    <div></div>
    <button class="primary">
      {$_('send.send_btn')}
    </button>
  </div>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;
	}
  div.card-wrapper {
    margin: 15px;
  }
</style>
