<script lang="ts">
    import type { IAccountState, IFTokenState } from 'background/storage';
    import type { BuildTokenTransferParams } from 'types/tx';
    import * as dn from 'dnum';
    
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';
    import ContactsIcon from '../components/icons/Contacts.svelte';
    import AmountInput from '../components/AmountInput.svelte';
    import Modal from '../components/Modal.svelte';
    import TokenSelector from '../modals/TokenSelectorModal.svelte';
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { currentParams } from 'popup/store/route';
    import { hashXORHex } from 'lib/utils/hashing';
    import { buildTokenTransfer } from 'popup/background/transactions';
    import { push } from 'popup/router/navigation';

    let recipientAddress = $state('');
    let amount = $state('');
    let selectedToken = $state<IFTokenState | undefined>(undefined);
    let showTokenModal = $state(false);
    let isLoading = $state(false);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount] as IAccountState | undefined);
    const tokens = $derived<IFTokenState[]>(currentWallet?.tokens ?? []);

    const balance = $derived(() => {
        if (!selectedToken || !currentAccount) return dn.from(0, 18);
        const rawBalance = selectedToken.balances[hashXORHex(currentAccount.pubKey)] ?? 0;
        return [BigInt(rawBalance), selectedToken.decimals] as dn.Dnum;
    });

    const inputAmount = $derived(() => {
        if (!amount.trim() || !selectedToken) {
            return dn.from(0, selectedToken?.decimals ?? 18);
        }
        try {
            return dn.from(amount.trim(), selectedToken.decimals);
        } catch {
            return dn.from(0, selectedToken.decimals);
        }
    });

    const isOverBalance = $derived(() => {
        if (!amount.trim() || !selectedToken) return false;
        return dn.greaterThan(inputAmount(), balance());
    });

    const isContinueDisabled = $derived(() => {
        if (!selectedToken || !currentAccount) return true;
        if (!amount.trim() || !recipientAddress.trim()) return true;
        if (isOverBalance()) return true;

        try {
            dn.from(amount.trim(), selectedToken.decimals);
            return false;
        } catch {
            return true;
        }
    });

    $effect(() => {
        if ($currentParams.addr) {
            recipientAddress = $currentParams.addr as string;
        }
    });

    $effect(() => {
        if (!tokens.length) {
            selectedToken = undefined;
            return;
        }

        if ($currentParams.token) {
            const tokenAddr = ($currentParams.token as string).toLowerCase();
            const foundToken = tokens.find(t => t.addr.toLowerCase() === tokenAddr);
            if (foundToken) {
                selectedToken = foundToken;
                return;
            }
        }

        if (!selectedToken || !tokens.find((token) => token.addr === selectedToken?.addr)) {
            selectedToken = tokens.find((token) => token.native) ?? tokens[0];
        }
    });

    function handleTokenSelect(token: IFTokenState) {
        selectedToken = token;
        showTokenModal = false;
    }

    function handleTokenSwitch() {
        if (tokens.length > 1) {
            showTokenModal = true;
        }
    }

    function handleMaxAmount() {
        if (!selectedToken || !currentAccount) return;
        const rawBalance = selectedToken.balances[hashXORHex(currentAccount.pubKey)] ?? '0';
        const maxDnum: dn.Dnum = [BigInt(rawBalance), selectedToken.decimals];
        amount = dn.toString(maxDnum);
    }

    async function handleContinue() {
        if (isContinueDisabled() || isLoading || !selectedToken || !currentAccount) return;

        isLoading = true;

        try {
            const params: BuildTokenTransferParams = {
                walletIndex: $globalStore.selectedWallet,
                accountIndex: currentWallet.selectedAccount,
                tokenAddr: selectedToken.addr,
                to: recipientAddress,
                amount: inputAmount()[0].toString(),
            };

            await buildTokenTransfer(params);
            push('/confirm');
        } catch (error) {
            console.error(error);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="page-container">
    <NavBar title={$_('tokenTransfer.title')} />
    <main class="content">
        {#if selectedToken && currentAccount}
            <AmountInput
                bind:value={amount}
                token={selectedToken}
                account={currentAccount}
                onTokenSelect={tokens.length > 1 ? handleTokenSwitch : undefined}
                onMax={handleMaxAmount}
            />
        {/if}
        <div class="recipient-section">
            <span class="section-label">{$_('tokenTransfer.sendTo')}</span>
            <SmartInput
                bind:value={recipientAddress}
                placeholder={$_('tokenTransfer.enterAddress')}
                hide={false}
                showToggle={false}
            >
                {#snippet rightAction()}
                    <button type="button" class="contacts-button" aria-label="Contacts">
                        <ContactsIcon />
                    </button>
                {/snippet}
            </SmartInput>
        </div>
    </main>
    <div class="footer">
        <Button 
            width="100%" 
            height={48} 
            disabled={isContinueDisabled()}
            loading={isLoading}
            onclick={handleContinue}
        >
            {$_('tokenTransfer.continue')}
        </Button>
    </div>
</div>

{#if tokens.length > 1}
    <Modal
        bind:show={showTokenModal}
        title={$_('receive.selectTokenTitle')}
        onClose={() => (showTokenModal = false)}
    >
        {#if currentAccount}
            <TokenSelector
                tokens={tokens}
                account={currentAccount}
                selectedToken={selectedToken}
                onSelect={handleTokenSelect}
            />
        {/if}
    </Modal>
{/if}

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
        gap: 24px;
        padding: 24px var(--padding-side);
        overflow-y: auto;
        min-height: 0;
    }

    .recipient-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .section-label {
        font-size: var(--font-size-small);
        font-weight: 500;
        color: var(--color-content-text-secondary);
    }

    .contacts-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: none;
        color: var(--color-content-icon-secondary);
        cursor: pointer;

        &:active {
            transform: scale(0.95);
        }

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }

    .footer {
        padding: 24px var(--padding-side) calc(16px + env(safe-area-inset-bottom));
        background: var(--color-neutral-background-base);
    }
</style>
