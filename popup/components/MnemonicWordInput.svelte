<script lang="ts">
    let {
        index = 1,
        word = '',
        isEditable = false,
        hasError = false,
        focus = false,
        onChanged = undefined
    }: {
        index: number;
        word: string;
        isEditable?: boolean;
        hasError?: boolean;
        focus?: boolean;
        onChanged?: (index: number, value: string) => void;
    } = $props();

    let inputValue = $state(word);
    let shouldUpdateFromProps = $state(true);
    let inputElement: HTMLInputElement | undefined = $state();
    let isFocused = $state(false);

    $effect(() => {
        if (shouldUpdateFromProps && word !== inputValue) {
            inputValue = word;
        }
        shouldUpdateFromProps = true;
    });

    $effect(() => {
        if (focus && inputElement && isEditable) {
            inputElement.focus();
        }
    });

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        shouldUpdateFromProps = false;
        inputValue = target.value;

        if (onChanged) {
            onChanged(index, target.value);
        }
    }

    function handleFocus() {
        isFocused = true;
    }

    function handleBlur() {
        isFocused = false;
    }
</script>

<div 
    class="mnemonic-word-input"
    class:has-error={hasError}
>
    <span class="word-index">
        {index}
    </span>
    <input
        bind:this={inputElement}
        type={isEditable && !isFocused ? "password" : "text"}
        value={inputValue}
        disabled={!isEditable}
        class="word-input"
        oninput={handleInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
    />
</div>

<style lang="scss">
    .mnemonic-word-input {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        height: 44px;
        background-color: var(--color-neutral-background-container);
        border-radius: 12px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:focus-within {
            background-color: var(--color-inputs-background-base);
            border-color: var(--color-inputs-border-focus);
        }
        
        &.has-error {
            border-color: var(--color-inputs-border-error);
            
            .word-index, .word-input {
                color: var(--color-inputs-border-error);
            }
        }
    }

    .word-index {
        font-size: var(--font-size-small);
        font-weight: 600;
        color: var(--color-content-text-secondary);
        min-width: 16px;
        flex-shrink: 0;
    }

    .word-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: var(--font-size-medium);
        font-weight: 500;
        color: var(--color-content-text-inverted);
        outline: none;
        padding: 0;
        width: 100%;
        
        &:disabled {
            cursor: default;
        }
    }
</style>
