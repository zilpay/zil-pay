<script lang="ts">
    import DownIcon from './icons/Down.svelte';
    import UpIcon from './icons/Up.svelte';

    let {
        label,
        time,
        fee,
        fiatFee,
        selected = false,
        expanded = false,
        loading = false,
        onselect,
        children = undefined
    }: {
        label: string;
        time: string;
        fee: string;
        fiatFee: string;
        selected?: boolean;
        expanded?: boolean;
        loading?: boolean;
        onselect: () => void;
        children?: any;
    } = $props();
</script>

<button class="gas-option" class:selected class:expanded class:loading onclick={onselect} disabled={loading}>
    <div class="main-row">
        <div class="left-section">
            <div class="selector" class:active={selected}>
                {#if selected}
                    <div class="selector-dot"></div>
                {/if}
            </div>
            <div class="info">
                <div class="label">{label}</div>
                <div class="time">{time}</div>
            </div>
        </div>
        <div class="right-section">
            <div class="fees">
                <div class="fee">{fee}</div>
                <div class="fiat-fee">{fiatFee}</div>
            </div>
            <div class="arrow">
                {#if expanded}
                    <UpIcon />
                {:else}
                    <DownIcon />
                {/if}
            </div>
        </div>
    </div>
    {#if expanded && children}
        <div class="details">
            {@render children()}
        </div>
    {/if}
</button>

<style lang="scss">
    .gas-option {
        position: relative;
        width: 100%;
        padding: 12px;
        background: var(--color-cards-regular-base-default);
        border-radius: 12px;
        border: 1px solid var(--color-cards-regular-border-default);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: all 0.2s ease;
        overflow: hidden;

        &.selected {
            background: var(--color-cards-regular-base-selected);
            border-color: var(--color-neutral-tag-purple-border);
        }

        &.loading {
            border-color: transparent;
            cursor: not-allowed;

            &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200%;
                height: 200%;
                background: conic-gradient(
                    from 180deg at 50% 50%,
                    var(--color-content-text-purple) 0%,
                    var(--color-button-regular-primary-default) 50%,
                    var(--color-content-text-purple) 100%
                );
                transform: translate(-50%, -50%);
                animation: spin 2s linear infinite;
                z-index: 0;
            }

            &::after {
                content: '';
                position: absolute;
                top: 1px;
                left: 1px;
                right: 1px;
                bottom: 1px;
                background: var(--color-cards-regular-base-default);
                border-radius: 11px;
                z-index: 1;
            }

            .main-row,
            .details {
                position: relative;
                z-index: 2;
            }
        }

        &:disabled {
            cursor: not-allowed;
        }
    }

    @keyframes spin {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }

    .main-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .left-section {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
    }

    .selector {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--color-controls-selector-border);
        background: var(--color-controls-selector-base);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.active {
            background: var(--color-controls-selector-select);
            border-color: var(--color-controls-selector-select);
        }
    }

    .selector-dot {
        width: 12px;
        height: 12px;
        background: var(--color-controls-selector-checker);
        border-radius: 50%;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .label {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
    }

    .time {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        line-height: 16px;
    }

    .right-section {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .fees {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .fee {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
    }

    .fiat-fee {
        color: var(--color-content-text-secondary);
        font-size: 12px;
        line-height: 16px;
    }

    .arrow {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }

    .details {
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
</style>
