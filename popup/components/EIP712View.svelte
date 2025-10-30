<script lang="ts">
    import { _ } from 'popup/i18n';
    import CopyButton from './CopyButton.svelte';

    interface Props {
        typedDataJson: string;
    }

    let { typedDataJson }: Props = $props();

    const parsedData = $derived(() => {
        try {
            return JSON.parse(typedDataJson);
        } catch {
            return null;
        }
    });

    const domain = $derived(parsedData()?.domain);
    const message = $derived(parsedData()?.message);
    const primaryType = $derived(parsedData()?.primaryType);

    function formatValue(value: unknown): string {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    }

    function isExpandable(value: unknown): boolean {
        return typeof value === 'object' && value !== null;
    }

    let expandedSections = $state<Set<string>>(new Set(['message']));

    function toggleSection(section: string) {
        const newSet = new Set(expandedSections);
        if (newSet.has(section)) {
            newSet.delete(section);
        } else {
            newSet.add(section);
        }
        expandedSections = newSet;
    }
</script>

{#if parsedData()}
<div class="typed-data-viewer">
    {#if domain}
    <div class="section">
        <button 
            class="section-header"
            onclick={() => toggleSection('domain')}
        >
            <span class="section-title">Domain</span>
            <span class="chevron" class:expanded={expandedSections.has('domain')}>▼</span>
        </button>
        {#if expandedSections.has('domain')}
        <div class="section-content">
            {#each Object.entries(domain) as [key, value]}
            <div class="field-row">
                <span class="field-label">{key}</span>
                <div class="field-value">
                    <span class="field-text">{formatValue(value)}</span>
                    <CopyButton value={formatValue(value)} />
                </div>
            </div>
            {/each}
        </div>
        {/if}
    </div>
    {/if}

    {#if message}
    <div class="section">
        <button 
            class="section-header"
            onclick={() => toggleSection('message')}
        >
            <span class="section-title">Message</span>
            <span class="chevron" class:expanded={expandedSections.has('message')}>▼</span>
        </button>
        {#if expandedSections.has('message')}
        <div class="section-content">
            {#each Object.entries(message) as [key, value]}
            <div class="field-row">
                <span class="field-label">{key}</span>
                <div class="field-value">
                    {#if isExpandable(value)}
                    <div class="nested-object">
                        <pre class="json-preview">{formatValue(value)}</pre>
                    </div>
                    {:else}
                    <span class="field-text">{formatValue(value)}</span>
                    <CopyButton value={formatValue(value)} />
                    {/if}
                </div>
            </div>
            {/each}
        </div>
        {/if}
    </div>
    {/if}

    {#if primaryType}
    <div class="section">
        <button 
            class="section-header"
            onclick={() => toggleSection('type')}
        >
            <span class="section-title">Primary Type</span>
            <span class="chevron" class:expanded={expandedSections.has('type')}>▼</span>
        </button>
        {#if expandedSections.has('type')}
        <div class="section-content">
            <div class="field-row">
                <span class="field-text mono">{primaryType}</span>
                <CopyButton value={primaryType} />
            </div>
        </div>
        {/if}
    </div>
    {/if}

    <div class="section">
        <button 
            class="section-header"
            onclick={() => toggleSection('raw')}
        >
            <span class="section-title">Raw Data</span>
            <span class="chevron" class:expanded={expandedSections.has('raw')}>▼</span>
        </button>
        {#if expandedSections.has('raw')}
        <div class="section-content">
            <pre class="raw-json">{JSON.stringify(parsedData(), null, 2)}</pre>
        </div>
        {/if}
    </div>
</div>
{:else}
<div class="error-container">
    <span class="error-text">Invalid typed data format</span>
</div>
{/if}

<style lang="scss">
    .typed-data-viewer {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section {
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
        overflow: hidden;
    }

    .section-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        background: none;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background: var(--color-cards-regular-base-selected-hover);
        }
    }

    .section-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
        color: var(--color-content-text-inverted);
    }

    .chevron {
        font-size: 12px;
        color: var(--color-content-text-secondary);
        transition: transform 0.2s ease;

        &.expanded {
            transform: rotate(180deg);
        }
    }

    .section-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px 12px;
    }

    .field-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .field-label {
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
        color: var(--color-content-text-secondary);
    }

    .field-value {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        background: var(--color-neutral-background-container);
        border-radius: 8px;
    }

    .field-text {
        flex: 1;
        font-size: 14px;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        word-break: break-all;

        &.mono {
            font-family: Geist, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
    }

    .nested-object {
        flex: 1;
    }

    .json-preview {
        margin: 0;
        font-size: 12px;
        line-height: 18px;
        color: var(--color-content-text-inverted);
        font-family: Geist, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .raw-json {
        margin: 0;
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 8px;
        font-size: 12px;
        line-height: 18px;
        color: var(--color-content-text-inverted);
        font-family: Geist, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 300px;
        overflow-y: auto;
    }

    .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--color-error-background);
        border: 1px solid var(--color-negative-border-primary);
        border-radius: 12px;
    }

    .error-text {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-error-text);
    }
</style>
