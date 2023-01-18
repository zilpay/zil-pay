<script lang="ts">
  import type { StakeResponse } from 'types/stake';

	import { onMount, onDestroy } from 'svelte';
	import { push } from 'svelte-spa-router';
	import Big from 'big.js';

	import { _ } from 'popup/i18n';

	import NavClose from '../components/NavClose.svelte';
	import Smartinput from '../components/SmartInput.svelte';
  import Modal from '../components/Modal.svelte';
  import StakeOrders from '../modals/StakeOrders.svelte'

  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';
  import { formatNumber } from 'popup/filters/n-format';

	import zrcStore from 'popup/store/zrc';
  import themeStore from 'popup/store/theme';
	import walletStore from 'popup/store/wallet';

  import { getStakeProps } from 'app/backend/stake';
  import { AvelyStake } from 'app/mixins/stake';
    import { BrowserStorage } from 'lib/storage';
    import blocknumber from 'app/store/blocknumber';


  const stake = new AvelyStake();
  const min = 10;
  const stZIL = stake.stZIL;

  let data: StakeResponse = {
    fee: 0,
    block: 0,
    totalStaked: '1',
    totalSupply: '1',
    pendingOrders: [],
    unbounded: []
  };
  let ordersModal = false;
  let loading = true;
  let tokens = [
		{
			value: '0',
			meta: $zrcStore[0],
      approved: Big(0)
		},
		{
			value: '0',
			converted: 0,
			meta: stZIL,
      approved: Big(0)
		}
	];
  let modes = [
    {
      name: 'Skate',
      active: true,
      method: () => {
        modes[0].active = true;
        modes[1].active = false;
        tokens = tokens.reverse();

        const limit = stake.getVirtualParams(tokens, data);

        tokens[1].value = String(limit.rate);
        tokens[1].converted = limit.converted;
      }
    },
    {
      name: 'Withdraw',
      active: false,
      method: () => {
        modes[0].active = false;
        modes[1].active = true;
        tokens = tokens.reverse();

        const limit = stake.getVirtualParams(tokens, data);

        tokens[1].value = String(limit.rate);
        tokens[1].converted = limit.converted;
      }
    }
  ];


  $: ZIL = $zrcStore[0];
	$: account = $walletStore.identities[$walletStore.selectedAddress];
  $: mode = modes.find((m) => m.active);
  $: disabled = Number(tokens[0].value) > 0
    && Number(tokens[1].value) > 0
    && !loading
    && fromDecimals(account.zrc2[tokens[0].meta.base16], tokens[0].meta.decimals).gte(tokens[0].value);
  $: rate = tokens[0].meta.base16 === $zrcStore[0].base16 ?
    Number(data.totalSupply) / Number(data.totalStaked) : Number(data.totalStaked) / Number(data.totalSupply);

  function hanldeOnInput(value: string, index: number) {
    try {
			tokens[index].value = String(Big(value));
		} catch {
			tokens[index].value = String(Big(0));
		}

    const limit = stake.getVirtualParams(tokens, data);

    tokens[1].value = String(limit.rate);
		tokens[1].converted = limit.converted;
	}

  async function submit(e: Event) {
		e.preventDefault();

    if (!disabled) {
      return;
    }

    loading = true;
    try {
      await stake.call(tokens);
      push('/confirm');
    } catch {
      ///
    }
    loading = false;
  }

  async function completeWithdrawal() {
    loading = true;
    try {
      await stake.completeWithdrawal();
      push('/confirm');
    } catch {
      ///
    }
    loading = false;
  }

  function hanldeShowOrders() {
    ordersModal = !ordersModal;
  }

  const storageObserver = BrowserStorage.subscribe(async(event) => {
    const newBlockNumber = event['blocknumber'];
		if (newBlockNumber) {
      blocknumber.set(newBlockNumber.newValue);
			data = await getStakeProps();
		}
	});

  onMount(async() => {
    try {
      loading = true;
      data = await getStakeProps();
    } catch (err) {
      console.error(err);
    }

    loading = false;
	});

  onDestroy(() => {
		storageObserver.unsubscribe();
	});
</script>

<Modal
  show={ordersModal}
  title={'pending withdrawals'}
  on:close={hanldeShowOrders}
>
  <div class="m-warp">
    <StakeOrders
      identities={data.pendingOrders}
      stZIL={stZIL}
      ZIL={ZIL}
      delayBlock={data.block}
    />
  </div>
</Modal>
<main>
	<NavClose title={$_('stake.title')}/>
  <form on:submit={submit}>
    <div class="switcher">
      {#each modes as mode}
        <div
          class:active={mode.active}
          on:mouseup={mode.method}
        >
          {mode.name}
        </div>
      {/each}
    </div>
    <b>
      {$_('swap.form.from')}
    </b>
    <Smartinput
      img={viewIcon(tokens[0].meta.bech32, $themeStore)}
      symbol={tokens[0].meta.symbol}
      max={fromDecimals(account.zrc2[tokens[0].meta.base16], tokens[0].meta.decimals).toString()}
      value={tokens[0].value}
      loading={loading}
      percents={[0, 10, 30, 50, 70, 100]}
      on:input={(event) => hanldeOnInput(event.detail, 0)}
    />
    <b>
      {$_('swap.form.to')}
    </b>
    <Smartinput
      img={viewIcon(tokens[1].meta.bech32, $themeStore)}
      symbol={tokens[1].meta.symbol}
      value={tokens[1].value}
      loading={loading}
      converted={tokens[1].converted}
      percents={[]}
      disabled
    />
    <div class="info-wrp">
      <div>
        <ul>
          <li>
            <b>
              Minimum staking amount:
            </b>
            <b>
              {formatNumber(min)} {ZIL.symbol}
            </b>
          </li>
          <li>
            <b>
              Exchange rate
            </b>
            <b>
              1 {tokens[0].meta.symbol} = {formatNumber(rate)} {tokens[1].meta.symbol}
            </b>
          </li>
          <li>
            <b>
              Reward fee
            </b>
            <b>
              {data.fee / AvelyStake.FEE_DEMON}%
            </b>
          </li>
          {#if data.pendingOrders.length > 0}
            <hr>
            <li>
              <b>
                {data.pendingOrders.length} Pending withdrawals
              </b>
              <div
                class="btn primary"
                on:mouseup={hanldeShowOrders}
              >
                Show
              </div>
            </li>
          {/if}
          {#if data.unbounded.length > 0}
            <li>
              <b>
                {formatNumber(
                  fromDecimals(data.unbounded[0].st, stZIL.decimals),
                  stZIL.symbol
                )} / {formatNumber(
                  fromDecimals(data.unbounded[0].zil, ZIL.decimals),
                  ZIL.symbol
                )}
              </b>
              <div
                class="btn primary"
                on:mouseup={completeWithdrawal}
              >
                Claim
              </div>
            </li>
          {/if}
        </ul>
      </div>
    </div>
    <button
      class:loading={loading}
      disabled={!disabled}
      class="secondary"
    >
      {mode.name}
    </button>
    <a
			href="https://zilpay.io/terms"
			target="_blank"
			rel="noreferrer"
		>
			<p>
				{$_('swap.form.link')}
			</p>
		</a>
    <a
      href="https://testnet-dapp.avely.fi/#FAQ"
      target="_blank"
      rel="noreferrer"
    >
      <p>
        FAQ
      </p>
    </a>
  </form>
</main>

<style lang="scss">
	@import "../styles";
	main {
		height: 100vh;
		background-color: var(--background-color);
		@include flex-center-top-column;

    & > div > b {
      margin-left: 16px;
    }
	}
  div.switcher {
    cursor: pointer;
    width: 100%;
  
    margin-block-start: 16px;
    margin-block-end: 16px;
  
    display: flex;
    justify-content: center;

    & > div {
      min-width: 80px;

      margin-left: 5px;
      margin-right: 5px;
      padding: 6px;;

      text-align: center;
      color: var(--text-color);
      font-family: Demi;
      font-size: 10pt;

      @include border-radius($default-border-radius);

      &.active {
        cursor: default;
        color: var(--button-color);
        background-color: var(--primary-color);
      }
    }
  }
  button {
    width: 100%;
  }
  a {
    text-align: center;
  }
  div.info-wrp {
    margin-block-start: 5px;
    margin-block-end: 5px;
    padding: 1px;

    background: linear-gradient(95.25deg, rgb(51, 227, 206) 1.47%, rgb(135, 117, 231) 80.7%);

    @include border-radius($default-border-radius);

    & > div {
      background-color: var(--card-color);
      padding: 16px;

      @include border-radius($default-border-radius);

      & > ul {
        margin: 0;
        padding: 0;

        & > li {
          padding: 3px;

          @include flex-between-row;

          & > .btn {
            font-size: 9pt;
            line-height: 14pt;
            width: auto;
            padding: 5px 22px 5px 22px;
            min-width: 80px;
          }
        }
      }
    }
  }
</style>
