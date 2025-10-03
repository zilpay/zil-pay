<script lang="ts">
    import SuccessIcon from '../components/icons/Success.svelte';

    let {
        label,
        sublabel,
        selected = false,
        onselect,
        disabled = false
    }: {
        label: string;
        sublabel?: string;
        selected?: boolean;
        onselect?: () => void;
        disabled?: boolean;
    } = $props();

    function handleSelect() {
        if (!disabled && onselect) {
            onselect();
        }
    }
</script>

<button
    class="selectable-item"
    class:selected
    class:disabled
    onclick={handleSelect}
    disabled={disabled}
>
    <div class="item-text">
        <span class="item-label">{label}</span>
        {#if sublabel}
            <span class="item-sublabel">{sublabel}</span>
        {/if}
    </div>
    {#if selected}
        <SuccessIcon />
    {/if}
</button>

<style lang="scss">
    .selectable-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 24px;
        padding: 8px 0;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: opacity 0.2s ease;
        
        &:not(:last-child) {
            border-bottom: 1px solid var(--color-cards-regular-border-default);
            padding-bottom: 20px;
            margin-bottom: 8px;
        }
        
        &:hover:not(:disabled) {
            opacity: 0.8;
        }
        
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        :global(svg) {
            width: 24px;
            height: 24px;
            color: var(--color-content-icon-accent-secondary);
            flex-shrink: 0;
        }
    }
    
    .item-text {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
    }
    
    .item-label {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
    }
    
    .item-sublabel {
        color: var(--color-content-text-secondary);
        font-size: 14px;
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
        white-space: nowrap;
    }
</style>
