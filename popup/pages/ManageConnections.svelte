<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    
    import NavBar from '../components/NavBar.svelte';
    import ConnectionItem from '../components/ConnectionItem.svelte';
    import ConnectionDetailsModal from '../modals/ConnectionDetailsModal.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import type { IWeb3ConnectionState } from 'background/storage/connections';
    import { disconnectWallet } from 'popup/background/connect';

    let searchTerm = $state('');
    let selectedConnection = $state<IWeb3ConnectionState | null>(null);
    let showDetailsModal = $state(false);

    const connections = $derived($globalStore.connections.list);

    const filteredConnections = $derived(() => {
        if (!connections) return [];

        const term = searchTerm.trim().toLowerCase();
        
        if (!term) return connections;

        return connections.filter(connection => 
            connection.title?.toLowerCase().includes(term) ||
            connection.domain.toLowerCase().includes(term) ||
            connection.origin.toLowerCase().includes(term)
        );
    });

    function handleConnectionClick(connection: IWeb3ConnectionState) {
        selectedConnection = connection;
        showDetailsModal = true;
    }

    async function handleConfirmDelete() {
        if (!selectedConnection) return;

        await disconnectWallet(selectedConnection.domain, $globalStore.selectedWallet);
        
        showDetailsModal = false;
        selectedConnection = null;
    }
</script>

<div class="page-container">
    <NavBar title={$_('settings.connections')} />

    <main class="content">
        {#if connections && connections.length > 0}
            <div class="search-container">
                <SmartInput
                    bind:value={searchTerm}
                    placeholder={$_('connections.search')}
                    showToggle={false}
                >
                    {#snippet leftIcon()}
                        <SearchIcon />
                    {/snippet}
                </SmartInput>
            </div>

            {#if filteredConnections().length > 0}
                <div class="connections-list">
                    {#each filteredConnections() as connection (connection.origin)}
                        <ConnectionItem
                            {connection}
                            onclick={() => handleConnectionClick(connection)}
                        />
                    {/each}
                </div>
            {:else}
                <div class="empty-state">
                    <p class="empty-text">{$_('connections.not_found')}</p>
                </div>
            {/if}
        {:else}
            <div class="empty-state">
                <p class="empty-text">{$_('connections.empty')}</p>
            </div>
        {/if}
    </main>
</div>

<ConnectionDetailsModal
    bind:show={showDetailsModal}
    connection={selectedConnection}
    ondelete={handleConfirmDelete}
/>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--color-neutral-background-base);
        padding: 0;
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        margin-top: var(--padding-side);
    }

    .search-container {
        margin-bottom: 16px;
    }

    .connections-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 40px 20px;
    }

    .empty-text {
        font-family: Geist;
        font-size: var(--font-size-large);
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
    }
</style>
