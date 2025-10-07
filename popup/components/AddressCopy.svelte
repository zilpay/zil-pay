<script lang="ts">
    import { truncate } from 'popup/mixins/address';
    import CopyButton from './CopyButton.svelte';

    let {
        name,
        address,
        onclick = () => {}
    }: {
        name: string;
        address: string;
        onclick?: () => void;
    } = $props();

    const truncatedAddress = $derived(truncate(address, 6, 6));

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            onclick();
        }
    }
</script>

<div
    class="account-card"
    onclick={onclick}
    onkeydown={handleKeydown}
    role="button"
    tabindex="0"
    aria-label={`Select account ${name}`}
>
    <div class="icon-container">
        <div class="jazzicon">
            <div class="jazzicon-shape"></div>
        </div>
    </div>

    <div class="info-container">
        <div class="account-name">{name}</div>
        <CopyButton value={truncatedAddress} />
    </div>
</div>

<style lang="scss">
    .account-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        cursor: pointer;
        text-align: left;
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
        border-radius: 4px;

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }
    }

    .icon-container {
        flex-shrink: 0;
    }

    .jazzicon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--color-content-text-pink);
        position: relative;
        overflow: hidden;
        outline: 2px solid transparent;
        transition: outline-color 0.2s ease;

        &:hover {
            outline-color: var(--color-neutral-border-hover);
        }
    }

    .jazzicon-shape {
        width: 74px;
        height: 30.77px;
        left: 11.38px;
        top: 16px;
        position: absolute;
        transform: rotate(30deg);
        transform-origin: top left;
        background: var(--color-neutral-background-base);
    }

    .info-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .account-name {
        font-size: var(--font-size-large);
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
