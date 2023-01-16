<script lang="ts">
  import type { StakeResponse } from 'types/stake';

	import { onMount, onDestroy } from 'svelte';

	import { _ } from 'popup/i18n';

	import NavClose from '../components/NavClose.svelte';
	import Smartinput from '../components/SmartInput.svelte';

  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';
  import { formatNumber } from 'popup/filters/n-format';

	import zrcStore from 'popup/store/zrc';
  import themeStore from 'popup/store/theme';
	import walletStore from 'popup/store/wallet';

  import { getStakeProps } from 'app/backend/stake';


  const min = 10;
  const stZIL = $zrcStore.find((t) => t.symbol === 'stZIL');

  let data: StakeResponse = {
    fee: 0,
    block: 0,
    totalStaked: '1',
    totalSupply: '1',
    pendingOrders: [],
    unbounded: []
  };
  let loading = true;
  let tokens = [
		{
			value: '0',
			meta: $zrcStore[0]
		},
		{
			value: '0',
			converted: 0,
			meta: stZIL
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
      }
    },
    {
      name: 'Withdraw',
      active: false,
      method: () => {
        modes[0].active = false;
        modes[1].active = true;
        tokens = tokens.reverse();
      }
    }
  ];


  $: ZIL = $zrcStore[0];
	$: account = $walletStore.identities[$walletStore.selectedAddress];
  $: mode = modes.find((m) => m.active);
  $: rate = tokens[0].meta.base16 === $zrcStore[0].base16 ?
    Number(data.totalSupply) / Number(data.totalStaked) : Number(data.totalStaked) / Number(data.totalSupply);

  onMount(async() => {
    try {
      loading = true;
      data = await getStakeProps();
    } catch (err) {
      console.error(err);
    }

    loading = false;
	});
</script>

<main>
	<NavClose title={$_('stake.title')}/>
  <div>
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
      on:input={(event) => console.log(event.detail, 0)}
    />
    <b>
      {$_('swap.form.to')}
    </b>
    <Smartinput
      img={viewIcon(tokens[1].meta.bech32, $themeStore)}
      symbol={tokens[1].meta.symbol}
      value={tokens[1].value}
      loading={loading}
      percents={[]}
      disabled
    />
    <div class="info-wrp">
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
            {data.fee / 10}%
          </b>
        </li>
      </ul>
    </div>
    <button
      class:loading={loading}
      disabled={loading}
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
  </div>
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
    margin-block-start: 8px;
    margin-block-end: 8px;

    box-shadow: rgb(50 50 93 / 25%) 0px 2px 5px -1px, rgb(0 0 0 / 30%) 0px 1px 3px -1px;

    padding: 16px;

    background-color: var(--card-color);

    @include border-radius($default-border-radius);

    & > ul {
      margin: 0;
      padding: 0;

      & > li {
        padding: 3px;

        @include flex-between-row;
      }
    }
  }
</style>
