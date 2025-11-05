<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';

    import NavBar from '../components/NavBar.svelte';
    import ActionCard from '../components/ActionCard.svelte';
    import Switch from '../components/Switch.svelte';
    import TokensFetcherIcon from '../components/icons/Currency.svelte';
    import ENSIcon from '../components/icons/ENS.svelte';
    import WordCountSelector from '../components/WordCountSelector.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const tokensListFetcher = $derived(currentWallet?.settings?.tokensListFetcher ?? false);
    const ensEnabled = $derived(currentWallet?.settings?.ensEnabled ?? false);
    const sessionTime = $derived(currentWallet?.settings?.sessionTime ?? 10800);

    const hourOptions = [3, 6, 12, 24];
    const selectedHours = $derived(() => {
        const h = Math.round((sessionTime || 10800) / 3600);
        return hourOptions.includes(h) ? h : 3;
    });

    async function updateSettings(patch: Record<string, any>) {
        const walletIndex = $globalStore.selectedWallet;
        if (walletIndex < 0 || !currentWallet) return;

        globalStore.update(state => {
            const wallets = [...state.wallets];
            wallets[walletIndex] = {
                ...wallets[walletIndex],
                settings: {
                    ...wallets[walletIndex].settings,
                    ...patch
                }
            };
            return { ...state, wallets };
        });
        await setGlobalState();
    }

    function handleTokensFetcherToggle() {
        updateSettings({ tokensListFetcher: !tokensListFetcher });
    }

    function handleEnsToggle() {
        updateSettings({ ensEnabled: !ensEnabled });
    }

    function handleSessionSelect(hours: number) {
        updateSettings({ sessionTime: Math.max(0, hours * 3600) });
    }
</script>

<div class="page-container">
    <NavBar title={$_('security.title')} />

    <main class="content">
        <h3 class="section-title">{$_('security.networkPrivacy')}</h3>

        <div class="cards">
            <ActionCard
                title={$_('security.tokensFetcher.title')}
                subtitle={$_('security.tokensFetcher.description')}
                onaction={handleTokensFetcherToggle}
            >
                {#snippet left()}
                    <TokensFetcherIcon />
                {/snippet}
                {#snippet right()}
                    <Switch checked={tokensListFetcher} variant="default" />
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
                    <Switch checked={ensEnabled} variant="default" />
                {/snippet}
            </ActionCard>
        </div>

        <section class="session-card" aria-labelledby="sessionTitle">
            <div id="sessionTitle" class="session-title">
                {$_('security.session.title')}
            </div>

            <div class="session-controls">
                <WordCountSelector
                    wordCounts={hourOptions}
                    selected={selectedHours()}
                    onSelect={handleSessionSelect}
                />
            </div>
        </section>
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

    .cards {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .session-card {
        background: var(--color-neutral-background-container);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 16px;
        padding: 14px 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .session-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-content-text-inverted);
        text-align: left;
    }

    .session-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
</style>
