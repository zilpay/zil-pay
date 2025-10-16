<script lang="ts">
    import RightIcon from './icons/Right.svelte';
    import LedftArrow from './icons/LedftArrow.svelte';

    let {
        title,
        value = $bindable(1),
        min = 1,
        max = 10,
        disabled = false,
        decrementLabel = 'Decrease',
        incrementLabel = 'Increase'
    }: {
        title: string;
        value?: number;
        min?: number;
        max?: number;
        disabled?: boolean;
        decrementLabel?: string;
        incrementLabel?: string;
    } = $props();

    function handleDecrement() {
        if (value > min && !disabled) {
            value--;
        }
    }

    function handleIncrement() {
        if (value < max && !disabled) {
            value++;
        }
    }

    function handleInput(event: Event) {
        if (disabled) return;
        
        const target = event.target as HTMLInputElement;
        const newValue = parseInt(target.value, 10);
        
        if (!isNaN(newValue)) {
            if (newValue < min) {
                value = min;
            } else if (newValue > max) {
                value = max;
            } else {
                value = newValue;
            }
        }
    }

    function handleBlur(event: Event) {
        if (disabled) return;
        
        const target = event.target as HTMLInputElement;
        if (target.value === '' || isNaN(parseInt(target.value, 10))) {
            value = min;
        }
    }
</script>

<div class="counter-card" class:disabled>
    <h4 class="counter-title">{title}</h4>
    <div class="counter">
        <button 
            class="counter-button"
            onclick={handleDecrement}
            disabled={value <= min || disabled}
            type="button"
            aria-label={decrementLabel}
        >
            <LedftArrow />
        </button>
        <input
            type="number"
            class="counter-input"
            bind:value
            oninput={handleInput}
            onblur={handleBlur}
            {min}
            {max}
            {disabled}
        />
        <button 
            class="counter-button"
            onclick={handleIncrement}
            disabled={value >= max || disabled}
            type="button"
            aria-label={incrementLabel}
        >
            <RightIcon />
        </button>
    </div>
</div>

<style lang="scss">
    .counter-card {
        padding: 16px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        &.disabled {
            opacity: 0.6;
            pointer-events: none;
        }
    }

    .counter-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .counter {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        background: var(--color-inputs-background-base);
        border-radius: 10px;
        border: 1px solid var(--color-inputs-border-default);
    }

    .counter-button {
        width: 32px;
        height: 32px;
        padding: 0;
        background: var(--color-button-regular-secondary-default);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-content-icon-primary);
        transition: background-color 0.2s ease;

        &:hover:not(:disabled) {
            background: var(--color-button-regular-secondary-hover);
        }

        &:active:not(:disabled) {
            transform: scale(0.95);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        :global(svg > path) {
            stroke: var(--color-content-icon-primary);
        }
        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }

    .counter-input {
        flex: 1;
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
        color: var(--color-content-text-inverted);
        background: transparent;
        border: none;
        outline: none;
        padding: 0;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        &:disabled {
            cursor: not-allowed;
        }
    }
</style>
