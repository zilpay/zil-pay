<script lang="ts">
  import Button from '../components/Button.svelte';
  import SmartInput from '../components/SmartInput.svelte';
  import CopyButton from '../components/CopyButton.svelte';
  import Bip39Icon from '../components/icons/Bip39Icon.svelte';
  import LockIcon from '../components/icons/LockIcon.svelte';
  import PuzzleIcon from '../components/icons/PuzzleIcon.svelte';
  import QRCodeIcon from '../components/icons/QRCodeIcon.svelte';
  import globalStore from 'popup/store/global';
  import { push } from '../router/navigation';
  import { WalletTypes } from 'config/wallet';
  import { themeDetect } from 'popup/mixins/theme';
  import { Themes } from 'config/theme';
    import { hashChainConfig } from 'lib/utils/hashing';

  let password = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  const wallets = $derived($globalStore.wallets);
  
  const currentTheme = $derived(
    $globalStore.appearances === Themes.System
      ? themeDetect()
      : $globalStore.appearances
  );

  function truncateAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }

  function getWalletTypeInfo(wallet: any): { type: string; icon: any } {
    switch (wallet.walletType) {
      case WalletTypes.SecretPhrase:
        return { type: 'BIP39', icon: Bip39Icon };
      case WalletTypes.SecretKey:
        return { type: 'Private Key', icon: LockIcon };
      case WalletTypes.Ledger:
        return { type: 'Ledger', icon: PuzzleIcon };
      default:
        return { type: 'Unknown', icon: QRCodeIcon };
    }
  }

  function getWalletLogo(wallet: any): string {
    if (wallet.accounts && wallet.accounts.length > 0) {
      const account = wallet.accounts[0];
      const chain = $globalStore.chains.find((c) => {
        const hash = hashChainConfig(c.chainIds, c.slip44, c.chain);
        return hash === account.chainHash;
      });
      
      if (chain?.logo) {
        const replacements = {
          'shortName': chain.shortName.toLowerCase(),
        };
        
        let processedLogo = chain.logo;
        for (const [key, value] of Object.entries(replacements)) {
          processedLogo = processedLogo.replace(new RegExp(`%{${key}}%`, 'g'), value);
        }
        
        if (processedLogo.includes('%{dark,light}%')) {
          processedLogo = processedLogo.replace(
            /%\{dark,light\}%/g, 
            currentTheme === Themes.Dark ? 'light' : 'dark'
          );
        }
        
        return processedLogo;
      }
    }
    
    return '/assets/icons/default_chain.svg';
  }

  async function handleUnlock() {
    if (!password.trim()) return;
    
    isLoading = true;
    error = null;

    try {
      push('/');
    } catch (err) {
      error = 'Invalid password';
    } finally {
      isLoading = false;
    }
  }

  function handleAddWallet() {
    push('/new-wallet-options');
  }

  function handlePasswordInput() {
    error = null;
  }
</script>

<div class="lock-page">
  <div class="header">
    <h1 class="title">Welcome back</h1>
    <button class="add-button" onclick={handleAddWallet}>
      <span class="add-icon">+</span>
    </button>
  </div>

  <div class="wallets-section">
    {#each wallets as wallet}
      {@const walletTypeInfo = getWalletTypeInfo(wallet)}
      {@const walletLogo = getWalletLogo(wallet)}
      
      <div class="wallet-card">
        <div class="wallet-icon">
          <img 
            src={walletLogo} 
            alt={wallet.walletName}
            class="chain-logo"
            onerror="this.src='/assets/icons/default_chain.svg'"
          />
        </div>
        
        <div class="wallet-info">
          <div class="wallet-header">
            <div class="wallet-name">{wallet.walletName}</div>
            <div class="wallet-type">
              <svelte:component this={walletTypeInfo.icon} width={16} height={16} />
              <span>{walletTypeInfo.type}</span>
            </div>
          </div>
          <div class="wallet-address">
            {truncateAddress(wallet.accounts?.[0]?.addr || wallet.uuid || '')}
          </div>
        </div>

        <div class="wallet-actions">
          <CopyButton 
            text={wallet.accounts?.[0]?.addr || wallet.uuid || ''}
            size={36}
            ariaLabel="Copy wallet address"
          />
        </div>
      </div>
    {/each}
  </div>

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
      disabled={!password.trim() || isLoading}
      loading={isLoading}
      onclick={handleUnlock}
      width="100%"
    >
      Unlock Wallet
    </Button>
  </div>
</div>

<style lang="scss">
  .lock-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--background-color);
    padding: 20px;
    box-sizing: border-box;
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

    &:hover {
      border-color: var(--primary-purple);
      background: color-mix(in srgb, var(--primary-purple) 10%, var(--card-background));
    }

    &:active {
      transform: scale(0.95);
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

    &:hover {
      border-color: color-mix(in srgb, var(--primary-purple) 30%, transparent);
      background: color-mix(in srgb, var(--card-background) 95%, var(--primary-purple));
    }
  }

  .wallet-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-color);
    border: 1px solid color-mix(in srgb, var(--text-secondary) 15%, transparent);
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

  .wallet-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .wallet-name {
    font-size: var(--font-size-large);
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wallet-type {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--primary-purple);
    
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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

  .wallet-actions {
    flex-shrink: 0;
  }

  .unlock-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
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

    .unlock-section {
      gap: 16px;
    }
  }

  @media (max-width: 360px) {
    .lock-page {
      padding: 12px;
    }

    .wallet-card {
      padding: 14px;
      gap: 10px;
    }

    .wallet-icon {
      width: 40px;
      height: 40px;
    }

    .wallet-actions {
      :global(.copy-button) {
        width: 32px;
        height: 32px;
        
        :global(svg) {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
</style>
