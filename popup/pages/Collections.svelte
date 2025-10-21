<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import { getAccountChain } from 'popup/mixins/chains';

    import Header from '../components/Header.svelte';
    import BottomTabs from '../components/BottomTabs.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import NFTCard from '../components/NFTCard.svelte';

    type NFTItem = {
        id: string;
        collectionName: string;
        collectionSymbol: string;
        imageUrl: string;
    };

    let searchTerm = $state('');

    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));

    const nftItems: NFTItem[] = [
        {
            id: '#5287',
            collectionName: 'Little Dragons',
            collectionSymbol: 'DRAG',
            imageUrl: 'https://placehold.co/240x240/8B1538/FFFFFF?text=Dragon'
        },
        {
            id: '#5288',
            collectionName: 'Little Dragons',
            collectionSymbol: 'DRAG',
            imageUrl: 'https://placehold.co/240x240/8B1538/FFFFFF?text=Dragon'
        },
        {
            id: '#5289',
            collectionName: 'Little Dragons',
            collectionSymbol: 'DRAG',
            imageUrl: 'https://placehold.co/240x240/8B1538/FFFFFF?text=Dragon'
        },
        {
            id: '#5290',
            collectionName: 'Little Dragons',
            collectionSymbol: 'DRAG',
            imageUrl: 'https://placehold.co/240x240/8B1538/FFFFFF?text=Dragon'
        }
    ];

    const groupedNFTs = $derived(() => {
        const filtered = searchTerm.trim()
            ? nftItems.filter(item =>
                item.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.collectionSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : nftItems;

        const groups = new Map<string, NFTItem[]>();
        
        filtered.forEach(item => {
            const key = `${item.collectionName}|${item.collectionSymbol}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        });

        return Array.from(groups.entries()).map(([key, items]) => {
            const [name, symbol] = key.split('|');
            return { collectionName: name, collectionSymbol: symbol, items };
        });
    });

    function handleNFTClick(nft: NFTItem) {
        console.log('NFT clicked:', nft);
    }

    async function handleRefresh() {
        console.log('Refresh NFTs');
    }
</script>

<div class="page-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: currentChain,
            theme: $globalStore.appearances
        })}
        networkImageAlt={currentChain?.name ?? ''}
        onRefresh={handleRefresh}
    />

    <main class="content">
        <div class="search-section">
            <SmartInput
                bind:value={searchTerm}
                placeholder={$_('nft.searchPlaceholder') || 'Name or symbol'}
                showToggle={false}
            >
                {#snippet leftIcon()}
                    <SearchIcon />
                {/snippet}
            </SmartInput>
        </div>

        <div class="nft-collections">
            {#each groupedNFTs() as collection (collection.collectionName + collection.collectionSymbol)}
                <div class="collection-group">
                    <div class="collection-header">
                        <h3 class="collection-name">{collection.collectionName}</h3>
                        <span class="collection-symbol">{collection.collectionSymbol}</span>
                    </div>

                    <div class="nft-grid">
                        {#each collection.items as nft (nft.id)}
                            <NFTCard
                                id={nft.id}
                                collectionName={nft.collectionName}
                                imageUrl={nft.imageUrl}
                                onclick={() => handleNFTClick(nft)}
                            />
                        {/each}
                    </div>
                </div>
            {/each}

            {#if groupedNFTs().length === 0}
                <div class="empty-state">
                    <p>{$_('nft.noResults') || 'No NFTs found'}</p>
                </div>
            {/if}
        </div>
    </main>

    <BottomTabs />
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow-y: auto;
    }

    .search-section {
        flex-shrink: 0;
        padding: 16px var(--padding-side);
    }

    .nft-collections {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding: 8px var(--padding-side) 24px;
        min-height: 0;
    }

    .collection-group {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .collection-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 4px;
    }

    .collection-name {
        color: var(--color-content-text-inverted);
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;
        margin: 0;
    }

    .collection-symbol {
        padding: 2px 8px;
        background: color-mix(in srgb, var(--color-neutral-tag-purple-fg) 12%, transparent);
        border: 1px solid var(--color-neutral-tag-purple-border);
        border-radius: 12px;
        color: var(--color-neutral-tag-purple-text);
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
    }

    .nft-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 16px;

        p {
            color: var(--color-content-text-secondary);
            font-size: 16px;
            line-height: 22px;
            margin: 0;
        }
    }
</style>
