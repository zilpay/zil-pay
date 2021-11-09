<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
	import { TokenType } from 'popup/config/token-type';
  import { uuidv4 } from 'lib/crypto/uuid';

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

  export let params = {
    type: TokenType.ZRC2,
    index: 0
  };

  let uuid = uuidv4();
  let selectedAccount = $walletStore.selectedAddress;
  let selectedToken = params.index;

	$: account = $walletStore.identities[selectedAccount];

  $: token = $zrcStore[selectedToken];
  $: tokenIcon = viewIcon(token.bech32, $themeStore);

  $: balance = fromDecimals(account.zrc2[token.base16], token.decimals).round(7);
	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, balance).round(7);

  onMount(() => {
		jazziconCreate(uuid, account.base16);
  });
</script>

<main>
	<NavClose title={$_('send.title')}/>
  <div in:fly={flyTransition.in}>
    <div>
      <SelectCard
        title={$_('send.cards.transfer')}
        header={account.name}
        text={trim(account.bech32)}
      >
        <div id={uuid}/>
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
    <form>
      <label>
        {$_('send.input_to.title')}
        <input
          placeholder={$_('send.input_to.placeholder')}
        >
      </label>
      <label>
        {$_('send.input_value.title')}
        <input
          placeholder={$_('send.input_value.placeholder')}
        >
      </label>
      <hr />
      <button class="primary">
        {$_('send.send_btn')}
      </button>
    </form>
  </div>
</main>

<style lang="scss">
	@import "../styles/mixins";
	main {
		background-color: var(--background-color);
		height: 100vh;

		@include flex-center-top-column;

    & > div {
      width: 100%;
      max-width: 500px;
      padding-left: 5px;
      padding-right: 5px;
    }
	}
  form {
    padding-left: 10px;
    padding-right: 10px;
    margin-block-start: 30px;
		@include flex-center-top-column;

    & > label {
      margin-block-start: 0.5rem;
      margin-block-end: 0.5rem;
      width: 100%;
    }

    & > button {
      margin-block-start: 1rem;
      width: 290px;
    }
  }
</style>
