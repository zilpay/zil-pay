<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';
    
    import NavBar from '../components/NavBar.svelte';
    import ActionCard from '../components/ActionCard.svelte';
    import Switch from '../components/Switch.svelte';
    import TokensFetcherIcon from '../components/icons/Currency.svelte';
    import ENSIcon from '../components/icons/ENS.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const tokensListFetcher = $derived(currentWallet?.settings?.tokensListFetcher ?? false);
    const ensEnabled = $derived(currentWallet?.settings?.ensEnabled ?? false);

    async function handleTokensFetcherToggle() {
        const walletIndex = $globalStore.selectedWallet;
        if (walletIndex < 0 || !currentWallet) return;

        globalStore.update(state => {
            const newWallets = [...state.wallets];
            newWallets[walletIndex] = {
                ...newWallets[walletIndex],
                settings: {
                    ...newWallets[walletIndex].settings,
                    tokensListFetcher: !tokensListFetcher
                }
            };
            return { ...state, wallets: newWallets };
        });

        await setGlobalState();
    }

    async function handleEnsToggle() {
        const walletIndex = $globalStore.selectedWallet;
        if (walletIndex < 0 || !currentWallet) return;

        globalStore.update(state => {
            const newWallets = [...state.wallets];
            newWallets[walletIndex] = {
                ...newWallets[walletIndex],
                settings: {
                    ...newWallets[walletIndex].settings,
                    ensEnabled: !ensEnabled
                }
            };
            return { ...state, wallets: newWallets };
        });

        await setGlobalState();
    }
</script>

<div class="page-container">
    <NavBar title={$_('security.title')} />

    <main class="content">
        <h3 class="section-title">{$_('security.networkPrivacy')}</h3>

        <div class="settings-list">
            <ActionCard
                title={$_('security.tokensFetcher.title')}
                subtitle={$_('security.tokensFetcher.description')}
                onaction={handleTokensFetcherToggle}
            >
                {#snippet left()}
                    <TokensFetcherIcon />
                {/snippet}
                {#snippet right()}
                    <Switch
                        checked={tokensListFetcher}
                        variant="default"
                    />
                {/snippet}
            </ActionCard>

            <ActionCard
                title={$_('security.ens.title')}
                subtitle={$_('security.ens.description')}
                onaction={handleEnsToggle}
            >
                {#snippet left()}
                    <ENSIcon />
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
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0;
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 24px var(--padding-side);
        overflow-y: auto;
    }

    .section-title {
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        color: var(--color-content-text-secondary);
        margin: 0;
    }

    .settings-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
</style>
