<script lang="ts">
    let {
        id,
        collectionName,
        imageUrl,
        onclick = () => {}
    }: {
        id: string;
        collectionName: string;
        imageUrl: string;
        onclick?: () => void;
    } = $props();
</script>

<button
    class="nft-card"
    onclick={onclick}
    type="button"
    aria-label={`${collectionName} ${id}`}
>
    <div class="nft-image-wrapper">
        <img
            src={imageUrl}
            alt={`${collectionName} ${id}`}
            class="nft-image"
            loading="lazy"
        />
    </div>
    <span class="nft-id">{id}</span>
</button>

<style lang="scss">
    .nft-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background: var(--color-cards-navigation-base-default);
        border: 2px solid transparent;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        text-align: left;

        &:hover {
            border-color: var(--color-neutral-tag-purple-border);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }
    }

    .nft-image-wrapper {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        background: var(--color-neutral-background-container);
    }

    .nft-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .nft-id {
        color: var(--color-content-text-secondary);
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
    }
</style>
