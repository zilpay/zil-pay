<script lang="ts">
  import type { IWalletState } from 'background/storage';
  import Bip39Icon from './icons/Bip39Icon.svelte';
  import LockIcon from './icons/LockIcon.svelte';
  import LedgerIcon from './icons/Ledger.svelte';
  import { WalletTypes } from 'config/wallet';
  import FastImg from './FastImg.svelte';

  let {
    wallet,
    chainLogo,
    selected = false,
    onclick = () => {}
  }: {
    wallet: IWalletState;
    chainLogo: string;
    selected?: boolean;
    onclick?: () => void;
  } = $props();

  function truncateAddress(address: string): string {
  // TODO: move to dif file
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }
</script>

<button 
  class="wallet-card" 
  class:selected
  {onclick}
  type="button"
>
  <div class="wallet-icon">
    <FastImg
      src={chainLogo} 
      alt={wallet.walletName}
      class="chain-logo"
    />
  </div>
  
  <div class="wallet-info">
    <div class="wallet-name">{wallet.walletName}</div>
    <div class="wallet-address">
      {truncateAddress(wallet.uuid)}
    </div>
  </div>

  <div class="wallet-type">
    {#if wallet.walletType === WalletTypes.SecretPhrase}
      <Bip39Icon width={16} height={16} />
    {:else if wallet.walletType === WalletTypes.SecretKey}
      <LockIcon width={16} height={16} />
    {:else if wallet.walletType === WalletTypes.Ledger}
      <LedgerIcon width={16} height={16} />
    {:else}
      <LockIcon width={16} height={16} />
    {/if}
  </div>
</button>

<style lang="scss">
  .wallet-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--card-background);
    border-radius: 16px;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    width: 100%;
    text-align: left;

    &:hover {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }

    &.selected {
      border-color: var(--primary-purple);
      background: color-mix(in srgb, var(--primary-purple) 10%, var(--card-background));
      
      .wallet-name {
        color: var(--primary-purple);
      }
    }

    &:focus {
      outline: none;
      border-color: var(--primary-purple);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-purple) 15%, transparent);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .wallet-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .chain-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .wallet-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .wallet-name {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  .wallet-address {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
    font-family: 'Courier New', monospace;
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wallet-type {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-purple);
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    .wallet-card {
      padding: 16px;
      gap: 12px;
    }

    .wallet-icon {
      width: 44px;
      height: 44px;
    }

    .wallet-name {
      font-size: var(--font-size-medium);
    }
  }

  @media (max-width: 360px) {
    .wallet-card {
      padding: 14px;
      gap: 10px;
    }

    .wallet-icon {
      width: 40px;
      height: 40px;
    }
  }
</style>
