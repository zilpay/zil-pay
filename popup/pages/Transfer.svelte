<script lang="ts">
    import type { IAccountState, IFTokenState } from 'background/storage';
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

    let recipientAddress = $state('');
    let amount = $state('');
    let selectedToken = $state<IFTokenState | undefined>(undefined);
    let showTokenModal = $state(false);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount] as IAccountState | undefined);
    const tokens = $derived<IFTokenState[]>(currentWallet?.tokens ?? []);

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

    function formatUnits(rawValue: string, decimals: number) {
        try {
            const base = BigInt(rawValue);
            if (decimals === 0) {
                return base.toString();
            }
            const divisor = BigInt(10) ** BigInt(decimals);
            const integer = base / divisor;
            const fraction = base % divisor;
            if (fraction === 0n) {
                return integer.toString();
            }
            const fractionString = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
            return fractionString ? `${integer.toString()}.${fractionString}` : integer.toString();
        } catch {
            return '0';
        }
    }

    function handleMaxAmount() {
        if (!selectedToken || !currentAccount) return;
        const balance = selectedToken.balances[hashXORHex(currentAccount.pubKey)] ?? '0';
        amount = formatUnits(balance, selectedToken.decimals);
    }

    const isContinueDisabled = $derived(() => {
        if (!selectedToken || !currentAccount) return true;
        const trimmedAmount = amount.trim();
        const trimmedRecipient = recipientAddress.trim();
        if (!trimmedAmount || !trimmedRecipient) return true;
        const numeric = Number(trimmedAmount);
        if (!Number.isFinite(numeric) || numeric <= 0) return true;
        return false;
    });
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
        <Button width="100%" height={48} disabled={isContinueDisabled}>
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
