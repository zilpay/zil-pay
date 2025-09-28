<script module lang="ts">
    export interface OptionData<T> {
        value: T;
        title: string;
        subtitle: string;
        description: string;
    }
</script>

<script lang="ts" generics="T">
    let {
        options = [],
        selected = $bindable(),
        onSelect = () => {}
    }: {
        options: OptionData<T>[];
        selected: T;
        onSelect?: (value: T) => void;
    } = $props();

    function handleSelect(value: T) {
        selected = value;
        onSelect(value);
    }
</script>

<div class="radio-options-container" role="radiogroup">
    {#each options as option (option.value)}
        <button
            type="button"
            role="radio"
            aria-checked={selected === option.value}
            class="radio-option"
            class:selected={selected === option.value}
            onclick={() => handleSelect(option.value)}
        >
            <div class="option-indicator"></div>
            <div class="option-content">
                <span class="option-title">{option.title}</span>
                <p class="option-description">{option.description}</p>
                <span class="option-subtitle">{option.subtitle}</span>
            </div>
        </button>
    {/each}
</div>

<style lang="scss">
    .radio-options-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .radio-option {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        width: 100%;
        padding: 16px;
        background-color: var(--color-button-regular-quaternary-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 16px;
        cursor: pointer;
        text-align: left;
        transition: border-color 0.2s ease, background-color 0.2s ease;

        &:hover {
            border-color: var(--color-cards-regular-border-hover);
        }

        &:focus-visible {
            outline: 2px solid var(--color-inputs-border-focus);
            outline-offset: 2px;
        }

        &.selected {
            border-color: var(--color-controls-selector-select);
            
            .option-indicator {
                border-color: var(--color-controls-selector-select);

                &::after {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        }
    }

    .option-indicator {
        position: relative;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 2px;
        border: 2px solid var(--color-controls-selector-border);
        border-radius: 50%;
        transition: border-color 0.2s ease;

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background-color: var(--color-controls-selector-select);
            border-radius: 50%;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
    }

    .option-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .option-title {
        font-size: var(--font-size-large);
        font-weight: 600;
        color: var(--color-content-text-inverted);
        line-height: 1.4;
    }

    .option-description {
        font-size: var(--font-size-medium);
        color: var(--color-content-text-secondary);
        line-height: 1.5;
        margin: 0;
    }

    .option-subtitle {
        font-size: var(--font-size-medium);
        font-weight: 500;
        color: var(--color-content-text-purple);
        line-height: 1.4;
        margin-top: 4px;
    }
</style>
