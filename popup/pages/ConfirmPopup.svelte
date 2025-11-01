<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { currentParams } from 'popup/store/route';

    import { viewChain } from 'lib/popup/url';
    import { getAccountChain } from 'popup/mixins/chains';
    import { push } from 'popup/router/navigation';
    import { estimateGas, rejectConfirm, signConfrimTx } from 'popup/background/transactions';
    import { abbreviateNumber } from 'popup/mixins/numbers';
    import { GasSpeed } from 'config/gas';
    import type { RequiredTxParams } from 'types/gas';
    import { calculateGasFee, createDefaultGasOption, type GasOptionDetails } from '../mixins/gas';
    import { getCurrencySymbol } from 'config/currencies';
    
    import RoundImageButton from '../components/RoundImageButton.svelte';
    import GasEditor from '../modals/GasEditor.svelte';
    import TransferSummary from '../components/TransferSummary.svelte';
    import TransferRoute from '../components/TransferRoute.svelte';
    import GasOption from '../components/GasOption.svelte';
    import GasDetailRow from '../components/GasDetailRow.svelte';
    import Button from '../components/Button.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import WarningIcon from '../components/icons/Warning.svelte';
    import CloseIcon from '../components/icons/Close.svelte';
    import { getGlobalState, setGlobalState } from 'popup/background/wallet';

    let selectedSpeed = $state<GasSpeed>($globalStore.wallets[$globalStore.selectedWallet].settings.gasOption ?? GasSpeed.Market);
    let expandedSpeed = $state<GasSpeed | null>(null);
    let gasEstimate = $state<RequiredTxParams | null>(null);
    let isLoading = $state(false);
    let isLoadingGasFetch = $state(true);
    let errorMessage = $state<string | null>(null);
    let showGasEditor = $state(false);

    const wallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const account = $derived(wallet?.accounts[wallet.selectedAccount]);
    const chain = $derived(getAccountChain($globalStore.selectedWallet));
    const confirmLastIndex = $derived(wallet ? wallet.confirm.length - 1 : -1);
    const confirmTx = $derived(confirmLastIndex !== -1 ? wallet.confirm[confirmLastIndex] : null);
    const confirmCount = $derived(wallet?.confirm.length ?? 0);
    const book = $derived($globalStore.book || []);
    const nativeToken = $derived(wallet?.tokens.filter((t) => t.addrType == confirmTx?.metadata?.token.addrType).find(t => t.native));
    const accountIndex = $derived(wallet?.selectedAccount ?? 0);

    const token = $derived(confirmTx?.metadata?.token ?? nativeToken);
    const tokenAmount = $derived(confirmTx?.metadata?.token?.value ?? confirmTx?.evm?.value ?? confirmTx?.scilla?.amount ?? '0');
    const toAddress = $derived(confirmTx?.metadata?.token.recipient ?? confirmTx?.evm?.to ?? confirmTx?.scilla?.toAddr ?? "");

    const recipientName = $derived(() => {
        if (!confirmTx) return null;
        const address = toAddress.toLowerCase();
        const bookEntry = book.find(entry => entry.address.toLowerCase() === address);
        if (bookEntry) return bookEntry.name;
        const walletAccount = wallet?.accounts.find(acc => acc.addr.toLowerCase() === address);
        if (walletAccount) return walletAccount.name;
        return null;
    });

    const tokenFiatValue = $derived(() => {
        if (!token || !token.rate || token.rate <= 0) return '-';
        const numericAmount = Number(tokenAmount) / (10 ** token.decimals);
        const convertedValue = numericAmount * token.rate;
        const currencySymbol = getCurrencySymbol(wallet?.settings?.currencyConvert ?? 'USD');
        return `${currencySymbol}${abbreviateNumber(convertedValue.toString(), 0)}`;
    });

    const gasOptions = $derived<GasOptionDetails[]>(
        gasEstimate && nativeToken
            ? calculateGasFee(gasEstimate, nativeToken, wallet.settings.currencyConvert)
            : [createDefaultGasOption()]
    );

    let fetchLock = false;
    let gasInFlight = false;
    let gasInterval: number | null = null;

    function dismissError() {
        errorMessage = null;
    }

    function gasMultiplier(speed: GasSpeed): bigint {
        if (speed === GasSpeed.Aggressive) return 20n;
        if (speed === GasSpeed.Market) return 15n;
        return 10n;
    }

    function handleGasEdit() {
        showGasEditor = true;
    }

    function handleGasSave(params: RequiredTxParams) {
        gasEstimate = params;
    }

    function handleSessionError(e: unknown) {
        if (String(e).includes('Session')) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/lock');
            }
            return true;
        }
        return false;
    }

    async function handleSpeedSelect(speed: GasSpeed) {
        if (selectedSpeed === speed) {
            expandedSpeed = expandedSpeed === speed ? null : speed;
        } else {
            selectedSpeed = speed;
            expandedSpeed = speed;
        }

        globalStore.update(state => {
            const newWallets = [...state.wallets];
            newWallets[$globalStore.selectedWallet] = {
                ...newWallets[$globalStore.selectedWallet],
                settings: {
                    ...newWallets[$globalStore.selectedWallet].settings,
                    gasOption: speed,
                }
            };
            return { ...state, wallets: newWallets };
        });

        await setGlobalState();
    }

    async function handleReject() {
        if (confirmLastIndex === -1 || isLoading) return;
        isLoading = true;
        fetchLock = true;
        try {
            await rejectConfirm(confirmLastIndex, $globalStore.selectedWallet);
            await getGlobalState();

            if (wallet.confirm.length === 0) {
                if ($currentParams?.type === 'popup') {
                    window.close();
                } else {
                    push('/history');
                }
            }
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            fetchLock = false;
            isLoading = false;
        }
    }

    async function handleConfirm() {
        if (!wallet || isLoading) return;
        isLoading = true;
        fetchLock = true;
        try {
            const state = $globalStore;
            const confirm = state.wallets[state.selectedWallet].confirm[confirmLastIndex];
            if (!confirm || !gasEstimate) throw new Error('Missing transaction or gas params');

            const m = gasMultiplier(selectedSpeed);
            const gasPrice = (gasEstimate.gasPrice * m) / 10n;

            if (confirm?.evm) {
                confirm.evm.gasLimit = Number(gasEstimate?.txEstimateGas) ?? undefined;
                confirm.evm.nonce = gasEstimate.nonce;

                if (gasEstimate.feeHistory.priorityFee > 0n) {
                    const baseFee = gasEstimate.feeHistory.baseFee;
                    const priorityFee = (gasEstimate.feeHistory.priorityFee * m) / 10n;
                    const maxFee = (baseFee * 2n) + priorityFee;
                    confirm.evm.maxFeePerGas = maxFee.toString();
                    confirm.evm.maxPriorityFeePerGas = priorityFee.toString();
                } else {
                    confirm.evm.gasPrice = gasEstimate.gasPrice.toString();
                }
            } else if (confirm?.scilla) {
                confirm.scilla.nonce = gasEstimate.nonce + 1;
                confirm.scilla.gasLimit = gasEstimate.txEstimateGas.toString();
                confirm.scilla.gasPrice = gasPrice.toString();
            }

            await setGlobalState();
            await signConfrimTx(confirmLastIndex, $globalStore.selectedWallet, wallet.selectedAccount);
            await getGlobalState();

            if (wallet.confirm.length === 0) {
                if ($currentParams?.type === 'popup') {
                    window.close();
                } else {
                    push('/history');
                }
            }
        } catch (e) {
            if (!handleSessionError(e)) {
                errorMessage = String(e);
            }
        } finally {
            fetchLock = false;
            isLoading = false;
        }
    }

    async function fetchGasOnce() {
        if (confirmLastIndex === -1 || gasInFlight || fetchLock) return;
        gasInFlight = true;
        if (!gasEstimate) isLoadingGasFetch = true;
        try {
            const estimate = await estimateGas(confirmLastIndex, $globalStore.selectedWallet, accountIndex);
            gasEstimate = estimate;
        } catch (error) {
            if (!handleSessionError(error)) {
                if (!errorMessage) {
                    errorMessage = String(error);
                }
            }
        } finally {
            gasInFlight = false;
            isLoadingGasFetch = false;
        }
    }

    $effect(() => {
        const idx = confirmLastIndex;
        const acc = accountIndex;

        if (idx === -1 || acc < 0) return;

        let mounted = true;

        const start = async () => {
            await fetchGasOnce();
            if (!mounted) return;
            if (gasInterval) clearInterval(gasInterval);
            gasInterval = window.setInterval(fetchGasOnce, 10000);
        };

        start();

        return () => {
            mounted = false;
            if (gasInterval) {
                clearInterval(gasInterval);
                gasInterval = null;
            }
        };
    });
</script>

{#if !token || !chain || !account || confirmLastIndex === -1}
    <div class="loading-container"></div>
{:else}
    <div class="page-container">
        <header class="header">
            <h1 class="title">{confirmTx?.metadata?.title ?? ''}</h1>
            <div class="header-right">
                {#if confirmCount > 1}
                    <div class="confirm-counter">
                        <span class="counter-text">{confirmCount}</span>
                    </div>
                {/if}
                <RoundImageButton
                    imageSrc={viewChain({ network: chain, theme: $globalStore.appearances })}
                    alt={chain.name}
                    disabled={true}
                />
            </div>
        </header>

        <main class="content">
            <TransferSummary
                amount={abbreviateNumber(tokenAmount, token.decimals)}
                symbol={token.symbol}
                fiatValue={tokenFiatValue()}
            />
            <TransferRoute
                fromName={account.name || 'Unknown'}
                fromAddress={account.addr}
                toName={recipientName() || 'Unknown'}
                toAddress={toAddress}
            />

            <div class="transaction-section">
                {#if errorMessage}
                    <div class="error-banner" role="alert">
                        <div class="error-left">
                            <div class="error-icon">
                                <WarningIcon />
                            </div>
                            <div class="error-text">{errorMessage}</div>
                        </div>
                        <button class="error-close" onclick={dismissError} aria-label="Dismiss error">
                            <CloseIcon />
                        </button>
                    </div>
                {/if}

                <div class="section-header">
                    <span class="section-title">{$_('confirm.transaction')}</span>
                    <button class="edit-button" onclick={() => handleGasEdit()}>
                        <span>{$_('confirm.edit')}</span>
                        <EditIcon />
                    </button>
                </div>

                <div class="gas-options">
                    {#each gasOptions as option (option.speed)}
                        <GasOption
                            label={$_(option.label)}
                            time={option.time}
                            fee={option.fee}
                            fiatFee={option.fiatFee}
                            loading={isLoadingGasFetch && !gasEstimate}
                            selected={selectedSpeed === option.speed}
                            expanded={expandedSpeed === option.speed}
                            onselect={() => handleSpeedSelect(option.speed)}
                        >
                            {#each option.details as detail (detail.label)}
                                <GasDetailRow label={$_(detail.label)} value={detail.value} />
                            {/each}
                        </GasOption>
                    {/each}
                </div>
            </div>
        </main>

        <footer class="footer">
            <Button variant="outline" onclick={handleReject} disabled={isLoading}>
                {$_('confirm.reject')}
            </Button>
            <Button onclick={handleConfirm} disabled={isLoading || gasOptions.length === 0}>
                {$_('confirm.confirm')}
            </Button>
        </footer>
    </div>
{/if}

<GasEditor
    bind:show={showGasEditor}
    gasParams={gasEstimate}
    onSave={handleGasSave}
/>

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

    .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .confirm-counter {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
    }

    .counter-text {
        font-family: Geist;
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
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

    .error-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        background: var(--color-error-background);
        border: 1px solid var(--color-negative-border-primary);
        border-radius: 12px;
    }

    .error-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1;
    }

    .error-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;

        :global(svg) {
            width: 20px;
            height: 20px;
            color: var(--color-negative-border-primary);
        }
    }

    .error-text {
        color: var(--color-error-text);
        font-size: 14px;
        line-height: 20px;
        word-break: break-word;
    }

    .error-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: none;
        border: none;
        border-radius: 6px;
        color: var(--color-error-text);
        cursor: pointer;
        transition: background-color 0.2s ease;

        :global(svg) {
            width: 18px;
            height: 18px;
        }

        &:hover {
            background: color-mix(in srgb, var(--color-negative-border-primary) 20%, transparent);
        }
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

    .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .footer {
        margin-top: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 16px;
        background: var(--color-neutral-background-base);
        border-top: 1px solid var(--color-cards-regular-border-default);
    }
</style>
