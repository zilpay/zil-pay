<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { SvelteComponent } from 'svelte';

    let {
        label,
        Icon,
        onclick = () => {},
        rightComponent = undefined,
        iconClass = ''
    }: {
        label: string;
        Icon: new (...args: any) => SvelteComponent;
        onclick?: () => void;
        rightComponent?: Snippet;
        iconClass?: string;
    } = $props();
</script>

<button class="settings-item" {onclick}>
    <span class="label">{label}</span>
    <div class="right-content">
        {#if rightComponent}
            {@render rightComponent()}
        {:else}
            <div class={`icon-wrapper ${iconClass}`}>
                <Icon />
            </div>
        {/if}
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

    .right-content {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--settings-icon-color, var(--color-content-icon-secondary));

        :global(svg) {
            width: 100%;
            height: 100%;
        }
    }
</style>
