<script lang="ts">
	import { _ } from 'popup/i18n';

	import NavClose from '../components/NavClose.svelte';
	import Smartinput from '../components/SmartInput.svelte';
  import Arrow from '../components/icons/Arrow.svelte';

  import { viewIcon } from 'lib/block-explorer/view';
  import { fromDecimals } from 'popup/filters/units';
  import { formatNumber } from 'popup/filters/n-format';

	import zrcStore from 'popup/store/zrc';
  import themeStore from 'popup/store/theme';
	import walletStore from 'popup/store/wallet';


  const min = 10;

  let modes = [
    {
      name: 'Skate',
      active: true,
      method: () => {
        modes[0].active = true;
        modes[1].active = false;
        modes[2].active = false;
      }
    },
    {
      name: 'Withdraw',
      active: false,
      method: () => {
        modes[0].active = false;
        modes[1].active = true;
        modes[2].active = false;
      }
    },
    {
      name: 'Convert',
      active: false,
      method: () => {
        modes[0].active = false;
        modes[1].active = false;
        modes[2].active = true;
      }
    }
  ];

  $: ZIL = $zrcStore[0];
  $: stZIL = $zrcStore[1];
	$: account = $walletStore.identities[$walletStore.selectedAddress];
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
    <div class="imgs">
      <img
        src={viewIcon(ZIL.bech32, $themeStore)}
        alt={ZIL.symbol}
        height="30"
      >
      <Arrow />
      <img
        src={viewIcon(stZIL.bech32, $themeStore)}
        alt={stZIL.symbol}
        height="30"
      >
    </div>
    <Smartinput
      img={viewIcon(ZIL.bech32, $themeStore)}
      symbol={ZIL.symbol}
      max={fromDecimals(account.zrc2[ZIL.base16], ZIL.decimals).toString()}
      value={'0'}
      loading={false}
      on:input={(event) => console.log(event.detail, 0)}
    />
    <div class="balance">
      <b>
        Balance
      </b>
      <b>
        {formatNumber(fromDecimals(account.zrc2[ZIL.base16], ZIL.decimals).toString())}
      </b>
    </div>
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
            You will receive
          </b>
          <b>
            2.62423 stZIL
          </b>
        </li>
        <li>
          <b>
            Exchange rate
          </b>
          <b>
            1 ZIL = 0.5248458611 stZIL
          </b>
        </li>
        <li>
          <b>
            Reward fee
          </b>
          <b>
            10%
          </b>
        </li>
      </ul>
    </div>
    <button class="secondary">
      Skate
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
  div.imgs {
    padding: 16px;

    @include flex-center;
  }
  div.info-wrp {
    margin-block-start: 8px;
    margin-block-end: 8px;

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
  div.balance {
    padding-right: 16px;
    padding-left: 16px;
    padding-top: 5px;

    @include flex-between-row;
  }
</style>
