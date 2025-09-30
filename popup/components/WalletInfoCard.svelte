<script lang="ts">
    import FastImg from './FastImg.svelte';

    let {
        iconSrc,
        title,
        subtitle,
        onclick = () => {}
    }: {
        iconSrc: string;
        title: string;
        subtitle: string;
        onclick?: () => void;
    } = $props();
</script>

<button class="wallet-info-card" {onclick}>
    <div class="icon-container">
        <FastImg src={iconSrc} alt={title} />
    </div>
    <div class="info-container">
        <div class="subtitle">{subtitle}</div>
        <div class="title">{title}</div>
    </div>
</button>

<style lang="scss">
    .wallet-info-card {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
        box-sizing: border-box;
        
        border: 1px solid transparent;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &:hover {
            border-color: var(--color-cards-regular-border-hover);
            background: var(--color-cards-regular-base-hover);
        }
    }

    .icon-container {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        background-color: var(--color-neutral-background-base);
    }

    .info-container {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        display: inline-flex;
        min-width: 0;
    }
    
    .subtitle {
        align-self: stretch;
        color: var(--color-content-text-secondary);
        font-size: var(--font-size-medium);
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
        word-wrap: break-word;
    }

    .title {
        align-self: stretch;
        color: var(--color-content-text-inverted);
        font-size: var(--font-size-large);
        font-family: Geist;
        font-weight: 700;
        line-height: 22px;
        word-wrap: break-word;
    }
</style>
