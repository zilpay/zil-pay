<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import { getAccountChain } from 'popup/mixins/chains';
    
    import RoundImageButton from '../components/RoundImageButton.svelte';
    import TransferSummary from '../components/TransferSummary.svelte';
    import TransferRoute from '../components/TransferRoute.svelte';
    import GasOption from '../components/GasOption.svelte';
    import GasDetailRow from '../components/GasDetailRow.svelte';
    import Button from '../components/Button.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import { push } from 'popup/router/navigation';
    import { estimateGas, rejectConfirm } from 'popup/background/transactions';
    import { getGlobalState } from 'popup/background/wallet';
    import { abbreviateNumber } from 'popup/mixins/numbers';
    import { GasSpeed } from 'config/gas';
    import type { RequiredTxParams } from 'types/gas';

    let selectedSpeed = $state<GasSpeed>(GasSpeed.Market);
    let expandedSpeed = $state<GasSpeed | null>(null);
    let gasEstimate = $state<RequiredTxParams | null>(null);

    const wallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const nativeToken = $derived(wallet.tokens[0]);
    const account = $derived(wallet?.accounts[wallet.selectedAccount]);
    const chain = $derived(getAccountChain($globalStore.selectedWallet));
    const confirmLastIndex = $derived(wallet.confirm.length - 1);
    const confirmTx = $derived(wallet?.confirm[confirmLastIndex]);
    const book = $derived($globalStore.book || []);
    const token = $derived(confirmTx.metadata?.token ?? nativeToken);
    const tokenAmount = $derived(confirmTx?.metadata?.token?.value ?? confirmTx.evm?.value ?? confirmTx.scilla?.amount ?? '0');
    const toAddress = $derived(confirmTx.metadata?.token.recipient ?? confirmTx.evm?.to ?? confirmTx.scilla?.toAddr ?? "");

    const recipientName = $derived(() => {
        if (!confirmTx) return; 

        const address = toAddress.toLowerCase();
        const bookEntry = book.find(entry => 
            entry.address.toLowerCase() === address
        );
        if (bookEntry) return bookEntry.name;

        const walletAccount = wallet?.accounts.find(acc => 
            acc.addr.toLowerCase() === address
        );
        if (walletAccount) return walletAccount.name;

        return null;
    });

    function handleSpeedSelect(speed: GasSpeed) {
        if (selectedSpeed === speed) {
            expandedSpeed = expandedSpeed === speed ? null : speed;
        } else {
            selectedSpeed = speed;
            expandedSpeed = null;
        }
    }

    function handleEdit() {
        push('/transfer');
    }

    async function handleReject() {
        await rejectConfirm(confirmLastIndex, $globalStore.selectedWallet);
        await getGlobalState();
    }

    function handleConfirm() {
    }

    $effect(() => {
        if (!confirmTx || !confirmTx?.metadata) {
            push('/');
        }
    });
    $effect(() => {
        let interval: NodeJS.Timeout;

        const updateGas = async () => {
            try {
                gasEstimate = await estimateGas(confirmLastIndex, $globalStore.selectedWallet, wallet.selectedAccount);
                console.log(gasEstimate);
            } catch (error) {
                console.error(error);
            }
        };

        updateGas();

        interval = setInterval(updateGas, 10000);

        return () => clearInterval(interval);
    });
</script>

<svelte:boundary onerror={async (error, _) => {
    console.warn(error);
    const wallet = $globalStore.wallets[$globalStore.selectedWallet];
    await rejectConfirm(wallet.confirm.length - 1, $globalStore.selectedWallet);
}}>
    <div class="page-container">
        <header class="header">
            <h1 class="title">{confirmTx?.metadata?.title ?? ''}</h1>
            {#if chain}
                <RoundImageButton
                    imageSrc={viewChain({ network: chain, theme: $globalStore.appearances })}
                    alt={chain.name}
                    disabled={true}
                />
            {/if}
        </header>

        <main class="content">
            <TransferSummary
                amount={abbreviateNumber(tokenAmount, token.decimals)}
                symbol={confirmTx.metadata?.token?.symbol ?? nativeToken.symbol}
                fiatValue="-"
            />

            <TransferRoute
                fromName={account?.name || 'Unknown'}
                fromAddress={account?.addr || ''}
                toName={recipientName() || 'Unknown'}
                toAddress={toAddress}
            />

            <div class="transaction-section">
                <div class="section-header">
                    <span class="section-title">{$_('confirm.transaction')}</span>
                    <button class="edit-button" onclick={handleEdit}>
                        <span>{$_('confirm.edit')}</span>
                        <EditIcon />
                    </button>
                </div>

                <div class="gas-options">
                    <GasOption
                  label="Low"
                        time="~2 min"
                        fee="0.000004"
                        fiatFee="0.00...0001 BTC"
                        selected={selectedSpeed === GasSpeed.Low}
                        expanded={expandedSpeed === GasSpeed.Low}
                        onselect={() => handleSpeedSelect(GasSpeed.Low)}
                    >
                        <GasDetailRow label="Estimated Gas" value="21000" />
                        <GasDetailRow label="Gas Price" value="0.20 Gwei" />
                        <GasDetailRow label="Base Fee" value="0.18 Gwei" />
                        <GasDetailRow label="Priority Fee" value="100000" />
                        <GasDetailRow label="Max Fee" value="100000" />
                    </GasOption>

                    <GasOption
                  label="Market"
                        time="~1 min"
                        fee="0.000004"
                        fiatFee="0.00...0001 BTC"
                        selected={selectedSpeed === GasSpeed.Market}
                        expanded={expandedSpeed === GasSpeed.Market}
                        onselect={() => handleSpeedSelect(GasSpeed.Market)}
                    >
                        <GasDetailRow label="Estimated Gas" value="21000" />
                        <GasDetailRow label="Gas Price" value="0.26 Gwei" />
                        <GasDetailRow label="Base Fee" value="0.22 Gwei" />
                        <GasDetailRow label="Priority Fee" value="125132" />
                        <GasDetailRow label="Max Fee" value="123125" />
                    </GasOption>

                    <GasOption
                  label="Aggressive"
                        time="~24 sec"
                        fee="0.000004"
                        fiatFee="0.00...0001 BTC"
                        selected={selectedSpeed === GasSpeed.Aggressive}
                        expanded={expandedSpeed === GasSpeed.Aggressive}
                        onselect={() => handleSpeedSelect(GasSpeed.Aggressive)}
                    >
                        <GasDetailRow label="Estimated Gas" value="21000" />
                        <GasDetailRow label="Gas Price" value="0.35 Gwei" />
                        <GasDetailRow label="Base Fee" value="0.28 Gwei" />
                        <GasDetailRow label="Priority Fee" value="150000" />
                        <GasDetailRow label="Max Fee" value="150000" />
                    </GasOption>
                </div>
            </div>
        </main>

        <footer class="footer">
            <Button variant="outline" onclick={handleReject}>
                {$_('confirm.reject')}
            </Button>
            <Button onclick={handleConfirm}>
                {$_('confirm.confirm')}
            </Button>
        </footer>
    </div>
</svelte:boundary>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0;
        box-sizing: border-box;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 56px;
        padding: 0 16px;
        flex-shrink: 0;
    }

    .title {
        color: var(--color-content-text-inverted);
        font-size: 20px;
        font-weight: 700;
        line-height: 30px;
        margin: 0;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px 16px;
        overflow-y: auto;
        min-height: 0;
    }

    .transaction-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .section-title {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
    }

    .edit-button {
        display: flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-content-text-purple);
        font-size: 14px;
        line-height: 20px;

        :global(svg) {
            width: 16px;
            height: 16px;
        }
    }

    .gas-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 16px;
        background: var(--color-neutral-background-base);
    }
</style>
