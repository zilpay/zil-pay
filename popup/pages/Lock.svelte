<script lang="ts">
  import type { IWalletState } from 'background/storage';
  import { tick } from 'svelte';
  import Button from '../components/Button.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import WalletCard from '../components/WalletCard.svelte';
  import globalStore from 'popup/store/global';
  import { push } from '../router/navigation';
  import { hashChainConfig } from 'lib/utils/hashing';
  import { viewChain } from 'lib/popup/url';
  import { _ } from '../i18n';
  import { unlockWallet } from 'popup/background/wallet';

  let password = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let selectedWalletIndex = $state<number | null>(
    $globalStore.wallets.length === 1 ? 0 : null,
  );

  const wallets = $derived($globalStore.wallets);
  const currentTheme = $derived($globalStore.appearances);
  const isWalletSelected = $derived(selectedWalletIndex !== null);

  $effect(() => {
    if (isWalletSelected) {
      tick().then(() => {
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        passwordInput?.focus();
      });
    }
  });

  function getWalletLogo(wallet: IWalletState): string {
    const chain = $globalStore.chains.find((c) => {
      const hash = hashChainConfig(c.chainIds, c.slip44, c.chain);
      return hash === wallet.defaultChainHash;
    });

    if (chain) {
      return viewChain({
        network: chain,
        theme: currentTheme,
      });
    }

    return '/assets/icons/default_chain.svg';
  }

  function handleWalletSelect(index: number) {
    if (isLoading) return;

    selectedWalletIndex = index;
    password = '';
    error = null;
  }

  async function handleUnlock(e: SubmitEvent) {
    e.preventDefault();
    if (!password.trim() || selectedWalletIndex === null || isLoading) return;

    isLoading = true;
    error = null;

    try {
      await unlockWallet(password, selectedWalletIndex);
      push('/');
    } catch (err) {
      error = `${$_('lockpage.invalidPassword')} ${err}`;
    } finally {
      isLoading = false;
    }
  }

  function handleAddWallet() {
    if (isLoading) return;
    push('/new-wallet-options');
  }
</script>

<div class="lock-page" class:disabled={isLoading}>
  <div class="header">
    <h1 class="title">{$_('lockpage.title')}</h1>
    <button
      class="add-button"
      onclick={handleAddWallet}
      disabled={isLoading}
      type="button"
      aria-label={$_('lockpage.addWalletButton')}>
      <span class="add-icon">+</span>
    </button>
  </div>

  <div class="content">
    <div class="wallets-section">
      {#each wallets as wallet, index}
        <WalletCard
          {wallet}
          chainLogo={getWalletLogo(wallet)}
          selected={selectedWalletIndex === index}
          onclick={() => handleWalletSelect(index)} />
      {/each}
    </div>

    <form class="form-section" onsubmit={handleUnlock}>
      <SmartInput
        id="password"
        label=""
        placeholder={isWalletSelected
          ? $_('lockpage.passwordPlaceholder')
          : $_('lockpage.selectWalletPlaceholder')}
        bind:value={password}
        hide={true}
        disabled={isLoading || !isWalletSelected}
        oninput={() => (error = null)}
        hasError={!!error}
        errorMessage={error || ''}
        width="100%" />

      <Button
        type="submit"
        disabled={!password.trim() || !isWalletSelected}
        loading={isLoading}
        width="100%"
        height={52}>
        {$_('lockpage.unlockButton')}
      </Button>
    </form>
  </div>
</div>

<style lang="scss">
  .lock-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--background-color);
    padding: 20px;
    box-sizing: border-box;
    transition: opacity 0.2s ease;

    &.disabled {
      pointer-events: none;
      opacity: 0.8;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-shrink: 0;
  }

  .title {
    font-size: calc(var(--font-size-xl) * 1.5);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .add-button {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--card-background);
    border: 2px solid color-mix(in srgb, var(--text-secondary) 20%, transparent);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--primary-purple);
      background: color-mix(in srgb, var(--primary-purple) 10%, var(--card-background));
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .add-icon {
    font-size: 24px;
    font-weight: bold;
    color: var(--primary-purple);
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .wallets-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding-bottom: 20px;
    min-height: 0;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
    padding-top: 8px;
  }

  @media (max-width: 480px) {
    .lock-page {
      padding: 16px;
    }

    .header {
      margin-bottom: 20px;
    }

    .title {
      font-size: var(--font-size-xl);
    }

    .add-button {
      width: 40px;
      height: 40px;
    }

    .add-icon {
      font-size: 20px;
    }

    .wallets-section {
      padding-bottom: 16px;
    }

    .form-section {
      gap: 14px;
    }
  }

  @media (max-width: 360px) {
    .lock-page {
      padding: 12px;
    }

    .wallets-section {
      padding-bottom: 12px;
    }

    .form-section {
      gap: 12px;
    }
  }

  @media (max-height: 600px) {
    .header {
      margin-bottom: 16px;
    }

    .wallets-section {
      padding-bottom: 12px;
    }

    .form-section {
      gap: 12px;
      padding-top: 4px;
    }
  }
</style>

