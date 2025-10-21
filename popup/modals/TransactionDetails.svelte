<script lang="ts">
    import type { IHistoricalTransactionState } from 'background/rpc/history_tx';
    import { TransactionStatus } from 'config/tx';
    import { formatDate } from 'popup/i18n';
    import { abbreviateNumber } from 'popup/mixins/numbers';
    import { processTokenLogo } from 'lib/popup/url';
    import { truncate } from 'popup/mixins/address';
    import globalStore from 'popup/store/global';
    import { _ } from 'popup/i18n';
    
    import FastImg from '../components/FastImg.svelte';
    import CopyButton from '../components/CopyButton.svelte';
    import SuccessIcon from '../components/icons/Success.svelte';
    import ClockIcon from '../components/icons/Close.svelte';
    import WarningIcon from '../components/icons/Warning.svelte';

    let {
        transaction
    }: {
        transaction: IHistoricalTransactionState;
    } = $props();

    const iconSrc = $derived(() => {
        if (transaction.metadata.icon) {
            return transaction.metadata.icon;
        }
        return processTokenLogo({
            token: transaction.metadata.token,
            theme: $globalStore.appearances
        });
    });

    const amount = $derived(() => {
        const value = transaction.metadata.token.value ?? 
                     transaction.evm?.value ?? 
                     transaction.scilla?.amount ?? '0';
        return abbreviateNumber(value, transaction.metadata.token.decimals);
    });

    const formattedDate = $derived(
        formatDate(transaction.timestamp, { 
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        })
    );

    const statusConfig = $derived(() => {
        switch (transaction.status) {
            case TransactionStatus.Success:
                return {
                    label: $_('txDetails.status.confirmed'),
                    icon: SuccessIcon,
                    color: 'success'
                };
            case TransactionStatus.Pending:
                return {
                    label: $_('txDetails.status.pending'),
                    icon: ClockIcon,
                    color: 'pending'
                };
            case TransactionStatus.Failed:
                return {
                    label: $_('txDetails.status.rejected'),
                    icon: WarningIcon,
                    color: 'error'
                };
            default:
                return {
                    label: $_('txDetails.status.unknown'),
                    icon: ClockIcon,
                    color: 'secondary'
                };
        }
    });

    const recipient = $derived(() => {
        if (transaction.metadata.token.recipient) {
            return transaction.metadata.token.recipient;
        }
        return transaction.evm?.to ?? transaction.scilla?.toAddr ?? '';
    });

    const txHash = $derived(() => {
        return transaction.evm?.transactionHash ?? transaction.scilla?.hash ?? '';
    });

    const sender = $derived(() => {
        return transaction.evm?.from ?? transaction.scilla?.senderAddr ?? '';
    });

    const gasUsed = $derived(() => {
        if (transaction.evm?.gasUsed) {
            return abbreviateNumber(transaction.evm.gasUsed, 0);
        }
        if (transaction.scilla?.receipt?.gas_used) {
            return abbreviateNumber(transaction.scilla.receipt.gas_used, 0);
        }
        return '-';
    });

    const gasPrice = $derived(() => {
        if (transaction.evm?.gasPrice) {
            return abbreviateNumber(transaction.evm.gasPrice, 9);
        }
        if (transaction.scilla?.gasPrice) {
            return abbreviateNumber(transaction.scilla.gasPrice, 12);
        }
        return '-';
    });

    const blockNumber = $derived(() => {
        return transaction.evm?.blockNumber ?? 
               transaction.scilla?.receipt?.epoch_num ?? 
               '-';
    });
</script>

<div class="tx-details-container">
    <div class="tx-header">
        <div class="icon-wrapper">
            <FastImg src={iconSrc()} alt={transaction.metadata.title} />
        </div>
        <div class="header-info">
            <h3 class="tx-title">{transaction.metadata.title}</h3>
            <div class="status-badge" class:success={statusConfig().color === 'success'} 
                                      class:pending={statusConfig().color === 'pending'} 
                                      class:error={statusConfig().color === 'error'}>
                <svelte:component this={statusConfig().icon} />
                <span>{statusConfig().label}</span>
            </div>
        </div>
    </div>

    <div class="amount-section">
        <div class="amount-value">
            -{amount()} {transaction.metadata.token.symbol}
        </div>
        <div class="amount-date">{formattedDate}</div>
    </div>

    <div class="details-section">
        <div class="detail-group">
            <span class="detail-label">{$_('txDetails.from')}</span>
            <div class="detail-value-copy">
                <span class="detail-value">{truncate(sender(), 8, 8)}</span>
                <CopyButton label="" value={sender()} />
            </div>
        </div>

        <div class="detail-group">
            <span class="detail-label">{$_('txDetails.to')}</span>
            <div class="detail-value-copy">
                <span class="detail-value">{truncate(recipient(), 8, 8)}</span>
                <CopyButton label="" value={recipient()} />
            </div>
        </div>

        {#if txHash()}
            <div class="detail-group">
                <span class="detail-label">{$_('txDetails.hash')}</span>
                <div class="detail-value-copy">
                    <span class="detail-value hash">{truncate(txHash(), 10, 10)}</span>
                    <CopyButton label="" value={txHash()} />
                </div>
            </div>
        {/if}

        <div class="detail-divider"></div>

        <div class="detail-group">
            <span class="detail-label">{$_('txDetails.gasUsed')}</span>
            <span class="detail-value">{gasUsed()}</span>
        </div>

        <div class="detail-group">
            <span class="detail-label">{$_('txDetails.gasPrice')}</span>
            <span class="detail-value">{gasPrice()} Gwei</span>
        </div>

        {#if blockNumber() !== '-'}
            <div class="detail-group">
                <span class="detail-label">{$_('txDetails.block')}</span>
                <span class="detail-value">{blockNumber()}</span>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .tx-details-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
    }

    .tx-header {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-container);
        flex-shrink: 0;

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .header-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
    }

    .tx-title {
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;
        color: var(--color-content-text-inverted);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
        width: fit-content;

        :global(svg) {
            width: 16px;
            height: 16px;
        }

        &.success {
            background: color-mix(in srgb, var(--color-positive-border-primary) 10%, transparent);
            color: var(--color-positive-border-primary);
            border: 1px solid var(--color-positive-border-primary);
        }

        &.pending {
            background: color-mix(in srgb, var(--color-content-text-purple) 10%, transparent);
            color: var(--color-content-text-purple);
            border: 1px solid var(--color-neutral-tag-purple-border);
        }

        &.error {
            background: color-mix(in srgb, var(--color-negative-border-primary) 10%, transparent);
            color: var(--color-negative-border-primary);
            border: 1px solid var(--color-negative-border-primary);
        }
    }

    .amount-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px;
        background: var(--color-neutral-background-container);
        border-radius: 16px;
    }

    .amount-value {
        font-size: 32px;
        font-weight: 700;
        line-height: 38px;
        color: var(--color-content-text-inverted);
    }

    .amount-date {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-content-text-secondary);
    }

    .details-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .detail-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }

    .detail-label {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-content-text-secondary);
        flex-shrink: 0;
    }

    .detail-value {
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        text-align: right;

        &.hash {
            font-family: 'Courier New', monospace;
        }
    }

    .detail-value-copy {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
    }

    .detail-divider {
        height: 1px;
        background: var(--color-cards-regular-border-default);
        margin: 8px 0;
    }
</style>
