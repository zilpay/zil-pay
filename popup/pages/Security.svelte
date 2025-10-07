<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';

    import NavBar from '../components/NavBar.svelte';
    import ActionCard from '../components/ActionCard.svelte';
    import Switch from '../components/Switch.svelte';
    import EtherscanIcon from '../components/icons/Etherscan.svelte';
    import CurrencyIcon from '../components/icons/Currency.svelte';

    let settings = $derived($globalStore.wallets[$globalStore.selectedWallet]?.settings);

    let tokensFetcher = $state(settings?.tokensListFetcher ?? true);
    let ensEnabled = $state(settings?.ensEnabled ?? true);

    async function updateSettings() {
        if (!settings) return;

        const walletIndex = $globalStore.selectedWallet;
        
        globalStore.update(state => {
            const newWallets = [...state.wallets];
            const currentSettings = newWallets[walletIndex].settings;
            
            if (currentSettings) {
                 newWallets[walletIndex].settings = {
                    ...currentSettings,
                    tokensListFetcher: tokensFetcher,
                    ensEnabled: ensEnabled
                };
            }
            
            return { ...state, wallets: newWallets };
        });

        await setGlobalState();
    }

    $effect(() => {
        tokensFetcher = settings?.tokensListFetcher ?? true;
        ensEnabled = settings?.ensEnabled ?? true;
    });

    $effect(() => {
        if (settings) {
            updateSettings();
        }
    });

</script>

<div class="security-page-container">
    <NavBar title={$_('security.title')} />
    <main class="content">
        <h2 class="section-title">{$_('security.networkPrivacy')}</h2>
        <div class="options-group">
            <ActionCard 
                title={$_('security.tokensFetcher.title')}
                subtitle={$_('security.tokensFetcher.subtitle')}
                onaction={() => tokensFetcher = !tokensFetcher}
            >
                {#snippet left()}
                    <EtherscanIcon />
                {/snippet}
                {#snippet right()}
                    <Switch
                        checked={tokensFetcher}
                        variant="default"
                    />
                {/snippet}
            </ActionCard>
            <ActionCard 
                title={$_('security.ensDomains.title')}
                subtitle={$_('security.ensDomains.subtitle')}
                onaction={() => ensEnabled = !ensEnabled}
            >
                {#snippet left()}
                    <CurrencyIcon />
                {/snippet}
                {#snippet right()}
                    <Switch
                        checked={ensEnabled}
                        variant="default"
                    />
                {/snippet}
            </ActionCard>
        </div>
    </main>
</div>

<style lang="scss">
    .security-page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0 16px;
        box-sizing: border-box;
    }

    .content {
        padding-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-title {
        color: var(--color-content-text-secondary, #808080);
        font-size: 12px;
        font-family: Geist;
        font-weight: 400;
        line-height: 16px;
        margin: 0;
    }
    
    .options-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
</style>


