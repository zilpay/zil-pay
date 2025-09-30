<script lang="ts">
    import type { ComponentType, SvelteComponent } from 'svelte';

    let {
        label,
        Icon,
        onclick = () => {}
    }: {
        label: string;
        Icon: ComponentType<SvelteComponent>;
        onclick?: () => void;
    } = $props();
</script>

<button class="settings-item" {onclick}>
    <span class="label">{label}</span>
    <div class="icon-wrapper">
        <svelte:component this={Icon} />
    </div>
</button>

<style lang="scss">
    .settings-item {
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

    .label {
        color: var(--color-content-text-inverted);
        font-size: var(--font-size-large);
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
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
</style>
