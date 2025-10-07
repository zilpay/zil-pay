<script lang="ts">
    import Jazzicon from './Jazzicon.svelte';
    import CopyButton from './CopyButton.svelte';
    import { truncate } from 'popup/mixins/address';

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
            event.preventDefault();
            onclick();
        }
    }
</script>

<button
    class="account-card"
    onclick={onclick}
    onkeydown={handleKeydown}
    type="button"
    aria-label={`Select account ${name}`}
>
    <div class="icon-container">
        <Jazzicon seed={address} diameter={48} onclick={() => {}} />
    </div>

    <div class="info-container">
        <div class="account-name">{name}</div>
        <CopyButton value={address} label={truncatedAddress} />
    </div>
</button>

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

    .info-container {
        flex: 1;
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
