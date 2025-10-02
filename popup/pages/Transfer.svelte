<script lang="ts">
    import type { IAccountState, IFTokenState } from 'background/storage';
    import NavBar from '../components/NavBar.svelte';
    import AddressCopy from '../components/AddressCopy.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';
    import TokenCard from '../components/TokenCard.svelte';
    import ContactsIcon from '../components/icons/Contacts.svelte';
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { hashXORHex } from 'lib/utils/hashing';

    let recipientAddress = $state('');
    let amount = $state('');

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount] as IAccountState | undefined);
    
    // For now, let's just use the native token as the selected one.
    // A proper selection mechanism should be implemented later.
    const selectedToken = $derived(currentWallet?.tokens.find(t => t.native) || currentWallet?.tokens[0] as IFTokenState | undefined);

    function setAmountPercentage(percentage: number) {
        if (!selectedToken || !currentAccount) return;

        const balanceStr = selectedToken.balances[hashXORHex(currentAccount.pubKey)];
        
        if (balanceStr) {
            const balance = Number(balanceStr);
            if (!isNaN(balance)) {
                amount = ((balance / (10 ** selectedToken.decimals)) * (percentage / 100)).toString();
            }
        }
    }
</script>

<div class="page-container">
    <NavBar title={$_('tokenTransfer.title')} />

    {#if currentAccount && selectedToken}
        <div class="content">
            <div class="sender-section">
                <h2 class="section-title">{$_('tokenTransfer.senderAccount')}</h2>
                <AddressCopy name={currentAccount.name} address={currentAccount.addr} />
            </div>

            <div class="form-container">
                <div class="section">
                    <h2 class="section-title">{$_('tokenTransfer.selectToken')}</h2>
                    <TokenCard
                        token={selectedToken}
                        account={currentAccount}
                        hide={false}
                    />
                </div>

                <div class="section">
                    <h2 class="section-title">{$_('tokenTransfer.sendTo')}</h2>
                    <SmartInput
                        bind:value={recipientAddress}
                        placeholder={$_('tokenTransfer.enterAddress')}
                        hide={false}
                        showToggle={false}
                    >
                        {#snippet rightAction()}
                            <button class="contacts-button">
                                <ContactsIcon />
                            </button>
                        {/snippet}
                    </SmartInput>
                </div>

                <div class="section">
                    <h2 class="section-title">{$_('tokenTransfer.tokenAmount')}</h2>
                    <SmartInput
                        bind:value={amount}
                        placeholder={$_('tokenTransfer.enterAmount')}
                        hide={false}
                        showToggle={false}
                    />
                    <div class="percentage-buttons">
                        <button onclick={() => setAmountPercentage(10)}>10%</button>
                        <button onclick={() => setAmountPercentage(25)}>25%</button>
                        <button onclick={() => setAmountPercentage(50)}>50%</button>
                        <button onclick={() => setAmountPercentage(100)}>100%</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <Button>
                {$_('tokenTransfer.continue')}
            </Button>
        </div>
    {:else}
        <div class="content content-loading">
            <p>{$_('tokenTransfer.loading') || 'Loading...'}</p>
        </div>
    {/if}
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

    :global(.nav-bar) {
        margin-left: var(--padding-side);
        margin-right: var(--padding-side);
    }

    .content {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .content-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--color-content-text-secondary);
        padding-bottom: 24px;
    }

    .sender-section {
        margin-bottom: 24px;
        flex-shrink: 0;
        margin: var(--padding-side);
    }

    .section-title {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
        margin-bottom: 8px;
    }

    .form-container {
        background: var(--color-neutral-background-container);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        padding: var(--padding-side);
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1;
    }
    
    .section {
        display: flex;
        flex-direction: column;
    }

    .contacts-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .percentage-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-top: 8px;

        button {
            padding: 8px;
            background: var(--color-controls-tabs-fg);
            border-radius: 8px;
            border: 1px solid transparent;
            cursor: pointer;
            text-align: center;
            color: var(--color-content-text-inverted);
            font-size: 12px;
            font-family: Geist;
            font-weight: 400;
            line-height: 16px;
            transition: background-color 0.2s ease, border-color 0.2s ease;

            &:hover {
                background: var(--color-button-regular-quaternary-hover);
                border-color: var(--color-cards-regular-border-hover);
            }
        }
    }

    .footer {
        padding: 16px 0;
        background: var(--color-neutral-background-container);
        flex-shrink: 0;
        padding-left: 16px;
        padding-right: 16px;
    }
</style>


