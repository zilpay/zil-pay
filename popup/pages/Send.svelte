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
  import SvgLoader from '../components/SvgLoader.svelte';

  export let params = {
    type: TokenType.ZRC2,
    index: 0
  };

  let contactsModal = false;
  let accountsModal = false;
  let tokensModal = false;
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
        on:click={() => accountsModal = !accountsModal}
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
        on:click={() => tokensModal = !tokensModal}
      >
        <img
          src={tokenIcon}
          alt={token.symbol}
          width="36"
        />
      </SelectCard>
    </div>
    <form>
      <div class="input">
        <p>
          {$_('send.input_to.title')}
        </p>
        <label>
          <div on:click={() => contactsModal = !contactsModal}>
            <SvgLoader
              src="/vectors/contact.svg"
              className="cont-icon"
            />
          </div>
          <input
            placeholder={$_('send.input_to.placeholder')}
          >
        </label>
      </div>
      <div class="input">
        <p>
          {$_('send.input_value.title')}
        </p>
        <label>
          <div on:click={() => contactsModal = !contactsModal}>
            <img
              src={tokenIcon}
              alt={token.symbol}
              width="19"
            />
          </div>
          <input
            placeholder={$_('send.input_value.placeholder')}
          >
        </label>
        <div class="percentage">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
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
    margin-block-start: 15px;
		@include flex-center-top-column;

    & > div.input {
      width: 100%;

      @include flex-column;

      & > div.percentage {
        margin-block-start: 10px;
        margin-block-end: 10px;
        padding-left: 30px;
        padding-right: 30px;

        @include flex-between-row;

        & > span {
          font-family: Demi;
          color: var(--text-color);
          cursor: pointer;

          @include fluid-font(320px, 1024px, 13px, 16px);

          &:hover {
            color: var(--primary-color);
          }
        }
      }
      & > label {
        background-color: var(--card-color);

        max-height: 60px;

        @include flex-between-row;
        @include border-radius(8px);

        & > input {
          width: 100%;
          padding-left: 0;
        }
        & > div {
          cursor: pointer;
          padding: 20px;

          &:hover {
            :global(svg.cont-icon > path) {
              fill: var(--primary-color);
            }
          }
        }
      }
    }

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
