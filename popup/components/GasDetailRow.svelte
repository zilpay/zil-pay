<script lang="ts">
    let {
        label,
        value
    }: {
        label: string;
        value: string;
    } = $props();
</script>

<div class="gas-detail-row">
    <span class="label">{label}</span>
    <span class="value">{value}</span>
</div>

<style lang="scss">
    .gas-detail-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .label {
        color: var(--color-content-text-secondary);
        font-size: 14px;
        line-height: 20px;
    }

    .value {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        line-height: 20px;
        text-align: right;
    }
</style>
