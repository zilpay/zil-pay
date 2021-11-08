<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import flyTransition from 'popup/transitions/fly';

  import { trim } from 'popup/filters/trim';
  import { viewIcon } from 'lib/block-explorer/view';
	import { jazziconCreate } from 'popup/mixins/jazzicon';

  import zrcStore from 'app/store/zrc';
	import walletStore from 'popup/store/wallet';
  import themeStore from 'popup/store/theme';

	import { balanceUpdate } from 'popup/backend/wallet';

	import NavClose from '../components/NavClose.svelte';
  import SelectCard from '../components/SelectCard.svelte';

  let selectedAccount = $walletStore.selectedAddress;
  let selectedToken = 0;

	$: account = $walletStore.identities[selectedAccount];
  $: token = $zrcStore[selectedToken];
  $: tokenIcon = viewIcon(token.bech32, $themeStore);

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
      >
        <img
          src={tokenIcon}
          alt={token.symbol}
          width="36"
        />
      </SelectCard>
    </div>
    <div class="card"></div>
    <div class="card"></div>
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

    & > .card {
      & > p {
        margin: 0;
      }
      & > div {
        cursor: pointer;
        padding-left: 15px;
        padding-right: 15px;
        min-width: 290px;
        @include flex-between-row;

        & > span {
          margin-right: 10px;
        }
        & > div {
          width: 100%;

          & > h3 {
            margin-block-end: 0;
          }
          & > p {
            font-size: 12px;
            margin-block-start: 0;
          }
        }
      }
    }
  }
</style>
