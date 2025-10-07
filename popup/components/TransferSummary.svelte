<script lang="ts">
    let {
        amount,
        symbol,
        fiatValue
    }: {
        amount: string;
        symbol: string;
        fiatValue: string;
    } = $props();
</script>

<div class="transfer-summary">
    <div class="amount-line">
        <span class="amount">{amount}</span>
        <span class="symbol">{symbol}</span>
    </div>
    <div class="fiat">{fiatValue}</div>
</div>

<style lang="scss">
    .transfer-summary {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .amount-line {
        display: flex;
        gap: 8px;
    }

    .amount {
        color: var(--color-content-text-inverted);
        font-size: 28px;
        font-weight: 700;
        line-height: 32px;
    }

    .symbol {
        color: var(--color-content-text-secondary);
        font-size: 28px;
        font-weight: 700;
        line-height: 32px;
    }

    .fiat {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        line-height: 16px;
    }
</style>
