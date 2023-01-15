<script lang="ts">
	import { _ } from 'popup/i18n';

	import NavClose from '../components/NavClose.svelte';
	import Smartinput from '../components/SmartInput.svelte';

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
      }
    },
    {
      name: 'Withdraw',
      active: false,
      method: () => {
        modes[0].active = false;
        modes[1].active = true;
      }
    }
  ];

  $: ZIL = $zrcStore[0];
  $: stZIL = $zrcStore[1];
	$: account = $walletStore.identities[$walletStore.selectedAddress];
  $: mode = modes.find((m) => m.active);
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
      img={viewIcon(ZIL.bech32, $themeStore)}
      symbol={ZIL.symbol}
      max={fromDecimals(account.zrc2[ZIL.base16], ZIL.decimals).toString()}
      value={'0'}
      loading={false}
      on:input={(event) => console.log(event.detail, 0)}
    />
    <b>
      {$_('swap.form.to')}
    </b>
    <Smartinput
      img={viewIcon(stZIL.bech32, $themeStore)}
      symbol={stZIL.symbol}
      value={'0'}
      loading={false}
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
