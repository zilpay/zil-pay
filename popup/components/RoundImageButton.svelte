<script lang="ts">
    import FastImg from './FastImg.svelte';
    import DownIcon from './icons/Down.svelte';

    let {
        imageSrc = '',
        alt = '',
        disabled = false,
        onclick = () => {}
    }: {
        imageSrc?: string;
        alt?: string;
        disabled?: boolean;
        onclick?: () => void;
    } = $props();

    function handleClick() {
        if (!disabled) {
            onclick();
        }
    }
</script>

<button
    class="round-image-button"
    class:disabled
    onclick={handleClick}
    {disabled}
    aria-label={alt}
    type="button"
>
    <div class="image-container">
        {#if imageSrc}
            <FastImg src={imageSrc} {alt} class="button-image" />
        {/if}
    </div>

    <div class="arrow-icon">
        <DownIcon />
    </div>
</button>

<style lang="scss">
    .round-image-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        background-color: transparent;
        border: 1px solid var(--color-neutral-border-default);
        border-radius: 46px;
        cursor: pointer;
        transition: all 0.2s ease;
        height: 32px;
        box-sizing: border-box;

        &:hover:not(:disabled) {
            border-color: var(--color-neutral-border-hover);
        }

        &:focus-visible:not(:disabled) {
            outline: none;
            border-color: var(--color-inputs-border-focus);
        }

        &.disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    .image-container {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-neutral-background-base);
        flex-shrink: 0;
    }

    .image-container :global(.button-image) {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .arrow-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-content-icon-secondary);
        transition: color 0.2s ease;
        flex-shrink: 0;

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }
</style>
