<script lang="ts">
  import { fade } from 'svelte/transition';
  import { tick, onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';
	import { TokenType } from 'popup/config/token-type';
  import { uuidv4 } from 'lib/crypto/uuid';
  import { fromBech32 } from 'popup/backend/settings';

  import { trim } from 'popup/filters/trim';
  import { sendToSignTx } from 'popup/backend/sign';
  import { fromDecimals, toDecimals } from 'popup/filters/units';
  import { viewIcon } from 'lib/block-explorer/view';
	import { jazziconCreate } from 'popup/mixins/jazzicon';
  import { formatNumber } from 'popup/filters/n-format';
  import { convertRate } from 'popup/filters/convert-rate';
  import { fromPercent } from 'popup/filters/from-percent';
  import { gasToFee } from 'popup/filters/gas-to-fee';
  import { buildTx } from 'popup/mixins/tx-build';
  import { getZNS } from 'popup/backend/zns';

  import zrcStore from 'app/store/zrc';
	import walletStore from 'popup/store/wallet';
  import rateStore from 'popup/store/rate';
  import themeStore from 'popup/store/theme';
  import gasStore from 'popup/store/gas';
	import currencyStore from 'popup/store/currency';
	import format from 'popup/store/format';

	import { balanceUpdate } from 'popup/backend/wallet';

	import NavClose from '../components/NavClose.svelte';
  import SelectCard from '../components/SelectCard.svelte';
  import ContactIcon from '../components/icons/Contact.svelte';
  import Modal from '../components/Modal.svelte';
  import AccountsModal from '../modals/Accounts.svelte';
  import TokensModal from '../modals/Tokens.svelte';
  import AccountSelectorModal from '../modals/AccountSelector.svelte';

  export let params = {
    type: TokenType.ZRC2,
    index: 0,
    bech32: ''
  };

  let contactsModal = false;
  let accountsModal = false;
  let tokensModal = false;
  let loading = false;
  let loadingZNS = false;
  let uuid = uuidv4();
  let selectedAccount = $walletStore.selectedAddress;
  let selectedToken = params.index;
  let percentageList = [0, 25, 50, 100];
  let amount;
  let recipient = params.bech32;
  let recipientError = '';

	$: account = $walletStore.identities[selectedAccount];

  $: token = $zrcStore[selectedToken];
  $: tokenIcon = viewIcon(token.bech32, $themeStore);
  $: balance = fromDecimals(account.zrc2[token.base16], token.decimals).round(7);
  $: zils = balance.mul(token.rate || 1);
	$: rate = $rateStore[$currencyStore];
  $: converted = convertRate(rate, zils).round(7);
	$: disabled = !amount || !recipient;

  onMount(() => {
		jazziconCreate(uuid, account.base16);
  });
  const handleOnPercentage = (percent: number) => {
    const { gasLimit, gasPrice } = $gasStore;
    const { _fee } = gasToFee(gasLimit, gasPrice);
    const value = fromPercent(token, account.zrc2[token.base16], _fee, percent);
    const formated = fromDecimals(value, token.decimals);
    amount = String(formated);
  };
  const onSelectAccount = async ({ detail }) => {
    await tick();
    selectedAccount = detail;
    accountsModal = false;
	};
  const onSelectToken = async ({ detail }) => {
    await tick();
    selectedToken = detail;
    tokensModal = false;
	};
  const onSelectRecipient = ({ detail }) => {
    recipientError = '';
    recipient = detail;
    contactsModal = false;
  };
  const handleSubmit = async (e) => {
		e.preventDefault();
    loading = true;
    let toAddr = '';
    try {
      toAddr = await fromBech32(recipient);
    } catch (err) {
      recipientError = err.message;
      loading = false;
      return null;
    }

    try {
      const qa = toDecimals(amount, token.decimals);
      
      await buildTx(toAddr, qa, token);
      if (!disabled) {
        push('/confirm/' + selectedAccount);
      }
    } catch {
      ///
    }
    loading = false;
  };

  async function onInput(e) {
    recipientError = '';
    const { value } = e.target;
    const regExpDomain = /.*\w.zil/gm;

    if (regExpDomain.test(value)) {
      loadingZNS = true;
      try {
        const resolver = await getZNS(value);
        if (resolver.address) {
          recipient = resolver.address.bech32;
        } else {
          recipient = resolver.owner.bech32;
        }
      } catch (err) {        
        ///
      }
      loadingZNS = false;
    }
  }
</script>

<Modal
  show={tokensModal}
  title={$_('send.input_to.title')}
  on:close={() => tokensModal = !tokensModal}
>
  <div class="m-warp">
    <TokensModal
      list={$zrcStore}
      index={selectedToken}
      account={account}
      on:selected={onSelectToken}
    />
  </div>
</Modal>
<Modal
  show={contactsModal}
  title={$_('send.cards.transfer')}
  on:close={() => contactsModal = !contactsModal}
>
  <div class="m-warp">
    <AccountSelectorModal on:selected={onSelectRecipient}/>
  </div>
</Modal>
<Modal
  show={accountsModal}
  title={$_('send.cards.token')}
  on:close={() => accountsModal = !accountsModal}
>
  <div class="m-warp">
    <AccountsModal
      list={$walletStore.identities}
      index={selectedAccount}
      on:selected={onSelectAccount}
    />
  </div>
</Modal>
<main>
	<NavClose title={$_('send.title')}/>
  <div in:fade>
    <div>
      <SelectCard
        title={$_('send.cards.transfer')}
        header={account.name}
        text={trim(account[$format])}
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
    <form
      in:fade
      on:submit={handleSubmit}
    >
      <div class="input">
        <p>
          {$_('send.input_to.title')}
        </p>
        <label class:error={recipientError}>
          <div on:click={() => contactsModal = !contactsModal}>
            <ContactIcon className="cont-icon" />
          </div>
          <input
            bind:value={recipient}
            class:loading={loadingZNS}
            disabled={loadingZNS}
            placeholder={$_('send.input_to.placeholder')}
            on:input={onInput}
          >
        </label>
      </div>
      <div class="input">
        <p>
          {$_('send.input_value.title')}
        </p>
        <label>
          <div>
            <img
              src={tokenIcon}
              alt={token.symbol}
              width="19"
            />
          </div>
          <input
            bind:value={amount}
            type="text"
            placeholder={$_('send.input_value.placeholder')}
          >
        </label>
        <div class="percentage">
          {#each percentageList as percentage}
            <span on:click={() => handleOnPercentage(percentage)}>{percentage}%</span>
          {/each}
        </div>
      </div>
      <hr />
      <button
        class="primary"
        class:loading={loading}
        disabled={disabled}
      >
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
      max-width: 290px;

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
        border: solid 1px var(--card-color);

        @include flex-between-row;
        @include border-radius(8px);

        &.error {
          border-color: var(--danger-color);
          input {
            color: var(--danger-color);
          }
        }
        & > input {
          width: 100%;
          padding-left: 0;
          border-color: var(--card-color);
        }
        & > div {
          cursor: pointer;
          padding: 13px;

          &:hover {
            :global(svg.cont-icon > path) {
              fill: var(--primary-color);
            }
          }
        }
        &:focus-within {
          border: solid 1px var(--text-color);
        }
      }
    }

    & > button {
      margin-block-start: 1rem;
      width: 290px;
    }
  }
</style>
