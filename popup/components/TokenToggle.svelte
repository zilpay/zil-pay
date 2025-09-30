<script lang="ts">
    import type { IFTokenState } from 'background/storage';
    import FastImg from './FastImg.svelte';
    import Switch from './Switch.svelte';
    import { processTokenLogo } from 'lib/popup/url';
    import globalStore from 'popup/store/global';

    let {
        token,
        disabled = false,
        value = true,
        onchange = (_: CustomEvent) => {}
    } = $props<{
        token: IFTokenState,
        disabled: boolean,
        value: boolean,
        onchange?: (e: Event) => void
    }>();

    const logo = $derived(processTokenLogo({
        token,
        theme: $globalStore.appearances,
    }));

    function handleToggle(newCheckedState: boolean) {
        onchange(new CustomEvent('change', { detail: newCheckedState }));
    }
</script>

<div class="token-list-item">
    <div class="info">
        <div class="icon-container">
            <FastImg src={logo} alt={token.name} />
        </div>
        <div class="text-info">
            <div class="token-name">{token.name}</div>
            <div class="token-symbol">{token.symbol}</div>
        </div>
    </div>
    <Switch 
        checked={value}
        disabled={disabled}
        onChange={handleToggle}
        variant="default"
    />
</div>

<style lang="scss">
    .token-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 12px;
        background: var(--color-cards-navigation-base-default);
        border-radius: 16px;
        box-sizing: border-box;
    }

    .info {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
    }

    .icon-container {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-neutral-background-base);
    }

    .text-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
    }

    .token-name {
        color: var(--color-content-text-inverted);
        font-size: var(--font-size-large);
        font-weight: 700;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .token-symbol {
        color: var(--color-content-text-secondary );
        font-size: var(--font-size-medium);
        font-weight: 400;
        line-height: 16px;
    }
</style>
