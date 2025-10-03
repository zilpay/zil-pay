<script lang="ts">
    import { _ } from 'popup/i18n';
    import { RatesApiOptions } from 'config/api';
    import SelectableListItem from '../components/SelectableListItem.svelte';

    type Engine = {
        id: RatesApiOptions;
        name: string;
        description: string;
    };

    let {
        selectedEngine,
        onselect
    }: {
        selectedEngine: RatesApiOptions;
        onselect: (engine: RatesApiOptions) => void;
    } = $props();

    const engines: Engine[] = [
        {
            id: RatesApiOptions.CoinGecko,
            name: 'Coingecko',
            description: $_('currency.engine.coingeckoDescription')
        },
        {
            id: RatesApiOptions.None,
            name: $_('currency.engine.none'),
            description: $_('currency.engine.noneDescription')
        }
    ];
</script>

<div class="engine-selector-container">
    {#each engines as engine (engine.id)}
        <SelectableListItem
            label={engine.name}
            sublabel={engine.description}
            selected={selectedEngine === engine.id}
            onselect={() => onselect(engine.id)}
        />
    {/each}
</div>

<style lang="scss">
    .engine-selector-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 20px 20px 20px;
    }
</style>
