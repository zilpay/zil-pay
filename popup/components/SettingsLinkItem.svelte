<script lang="ts">
    import type { SvelteComponent } from 'svelte';

    let {
        label,
        value,
        Icon,
        onclick = () => {}
    }: {
        label: string;
        value?: string | number;
        Icon: new (...args: any) => SvelteComponent;
        onclick?: () => void;
    } = $props();
</script>

<button class="settings-link-item" {onclick}>
    <div class="left-content">
        <div class="icon-wrapper">
            <Icon />
        </div>
        <span class="label">{label}</span>
    </div>
    {#if value !== undefined}
        <span class="value">{value}</span>
    {/if}
</button>

<style lang="scss">
    .settings-link-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 14px 0;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
    }

    .left-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--color-content-icon-secondary);

        :global(svg) {
            width: 100%;
            height: 100%;
        }
    }

    .label {
        color: var(--color-content-text-inverted);
        font-size: var(--font-size-large);
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
    }

    .value {
        color: var(--color-content-text-inverted);
        font-size: var(--font-size-large);
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
    }
</style>
