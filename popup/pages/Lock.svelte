<script lang="ts">
  import type { IWalletState } from 'background/storage';
  import Button from '../components/Button.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import WalletCard from '../components/WalletCard.svelte';
  import globalStore from 'popup/store/global';
  import { push } from '../router/navigation';
  import { hashChainConfig } from 'lib/utils/hashing';
  import { viewChain } from 'lib/popup/url';

  let password = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let selectedWalletIndex = $state<number | null>(null);
  let showPasswordInput = $state(false);

  const wallets = $derived($globalStore.wallets);
  const currentTheme = $derived($globalStore.appearances);

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
    showPasswordInput = true;
    password = '';
    error = null;
  }

  async function handleUnlock() {
    if (!password.trim() || selectedWalletIndex === null || isLoading) return;
    
    isLoading = true;
    error = null;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      push('/');
    } catch (err) {
      error = 'Invalid password';
    } finally {
      isLoading = false;
    }
  }

  function handleAddWallet() {
    if (isLoading) return;
    push('/new-wallet-options');
  }

  function handlePasswordInput() {
    error = null;
  }
</script>

<div class="lock-page" class:disabled={isLoading}>
  <div class="header">
    <h1 class="title">Welcome back</h1>
    <button 
      class="add-button" 
      onclick={handleAddWallet}
      disabled={isLoading}
      type="button"
    >
      <span class="add-icon">+</span>
    </button>
  </div>

  <div class="wallets-section">
    {#each wallets as wallet, index}
      <WalletCard
        {wallet}
        chainLogo={getWalletLogo(wallet)}
        selected={selectedWalletIndex === index}
        onclick={() => handleWalletSelect(index)}
      />
    {/each}
  </div>

  {#if showPasswordInput}
    <div class="unlock-section">
      <SmartInput
        id="password"
        label=""
        placeholder="Enter your password"
        bind:value={password}
        hide={true}
        disabled={isLoading}
        onInput={handlePasswordInput}
        hasError={!!error}
        errorMessage={error || ""}
        width="100%"
      />

      <Button
        disabled={!password.trim() || selectedWalletIndex === null}
        loading={isLoading}
        onclick={handleUnlock}
        width="100%"
      >
        Unlock Wallet
      </Button>
    </div>
  {/if}
</div>

<style lang="scss">
  .lock-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
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
    margin-bottom: 32px;
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

  .wallets-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
    max-height: 400px;
    overflow-y: auto;
  }

  .unlock-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
    padding: 20px;
    background: var(--card-background);
    border-radius: 16px;
    border: 2px solid var(--primary-purple);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    .lock-page {
      padding: 16px;
    }

    .header {
      margin-bottom: 24px;
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

    .unlock-section {
      gap: 16px;
      padding: 16px;
    }
  }

  @media (max-width: 360px) {
    .lock-page {
      padding: 12px;
    }

    .unlock-section {
      padding: 14px;
    }
  }
</style>
