<script lang="ts">
  import { _ } from 'popup/i18n';
  import { push } from 'popup/router/navigation';
  import { cacheStore } from 'popup/store/cache';
  import globalStore from '../store/global';
  import { walletFromAccountWatched } from 'popup/background/wallet';

  import NavBar from '../components/NavBar.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import Button from '../components/Button.svelte';
  import WalletInfoCard from '../components/WalletInfoCard.svelte';

  import { viewChain } from 'lib/popup/url';
    import type { IWalletSettingsState } from 'background/storage';
    import { HashTypes } from 'config/argon2';
    import { ShaAlgorithms } from 'config/pbkdf2';
    import { RatesApiOptions } from 'config/api';
    import { GasSpeed } from 'config/gas';

  let address = $state('');
  let accountName = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let walletSettings = $state<IWalletSettingsState>({
    cipherOrders: [],
    hashFnParams: {
      memory: 6553,
      threads: 4,
      secret: "",
      iterations: 3,
      hashType: HashTypes.Argon2,
      hashSize: ShaAlgorithms.Sha512,
    },
    currencyConvert: "BTC",
    ensEnabled: true,
    tokensListFetcher: true,
    ratesApiOptions: RatesApiOptions.CoinGecko,
    sessionTime: 0,
    gasOption: GasSpeed.Market,
  });

  const selectedChain = $derived($cacheStore.chain);

  $effect(() => {
    if (!$cacheStore.chain) {
      push('/network-setup');
    }
  });

  const isBech32 = (v: string) => /^zil1[0-9a-z]{38}$/i.test(v.trim());
  const isEvm = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());
  const isValidAddress = $derived(() => isBech32(address) || isEvm(address));
  const isFormValid = $derived(() => isValidAddress() && accountName.trim().length > 0 && !isLoading);

  function generateDefaultWalletName(): string {
    const chainName = $cacheStore.chain?.name;
    const walletCount = $globalStore.wallets.length;
    return `${chainName} ${walletCount + 1}`;
  }

  async function handleConfirm(e: SubmitEvent) {
    e.preventDefault();
    if (!isFormValid()) return;
    isLoading = true;
    error = null;
    try {
      await walletFromAccountWatched({
        address,
        accountName,
        walletName: generateDefaultWalletName(),
        chain: selectedChain!,
        settings: walletSettings,
      });
      push('/');
    } catch(e) {
      error = String(e);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="page-container">
  <NavBar title={$_('newWalletOptions.watchAccount.title')} />

  <main class="content">
    {#if selectedChain}
      <WalletInfoCard
        iconSrc={viewChain({ network: selectedChain, theme: $globalStore.appearances, })}
        subtitle={selectedChain.chain}
        title={selectedChain.name}
      />
    {/if}

    <form class="form" onsubmit={handleConfirm}>
      <SmartInput
        bind:value={address}
        placeholder={$_('watchAccount.addressPlaceholder')}
        hide={false}
        showToggle={false}
        hasError={Boolean(address) && !isValidAddress()}
        errorMessage={!isValidAddress() && address ? ($_('watchAccount.invalidAddress')) : ''}
        autofocus
      />
      <SmartInput
        bind:value={accountName}
        placeholder={$_('watchAccount.namePlaceholder')}
        hide={false}
        showToggle={false}
      />

      {#if error}
        <div class="error-banner">{error}</div>
      {/if}

      <div class="footer">
        <Button type="submit" loading={isLoading} disabled={!isFormValid()}>
          {$_('common.confirm')}
        </Button>
      </div>
    </form>
  </main>
</div>

<style lang="scss">
  .page-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--color-neutral-background-base);
    padding: 0;
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px var(--padding-side);
    overflow-y: auto;
    min-height: 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 4px;
  }

  .error-banner {
    padding: 12px;
    background: var(--color-error-background);
    color: var(--color-error-text);
    border-radius: 12px;
    font-size: var(--font-size-medium);
    line-height: 16px;
  }

  .footer {
    margin-top: 8px;
  }
</style>
