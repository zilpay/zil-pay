<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { selectAccount, destroyAccount } from 'popup/background/wallet';
    import { viewChain } from 'lib/popup/url';
    import { getAccountChain } from 'popup/mixins/chains';

    import NavBar from '../components/NavBar.svelte';
    import WalletInfoCard from '../components/WalletInfoCard.svelte';
    import AccountCard from '../components/AccountCard.svelte';
    import Button from '../components/Button.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import { push } from 'popup/router/navigation';
    import { WalletTypes } from 'config/wallet';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const accounts = $derived(currentWallet?.accounts ?? []);
    const selectedAccountIndex = $derived(currentWallet?.selectedAccount ?? 0);
    const currentChain = $derived(getAccountChain($globalStore.selectedWallet));

    async function handleAccountSelect(index: number) {
        if (!currentWallet || index === selectedAccountIndex) {
            push("/");
            return;
        };

        const walletIndex = $globalStore.selectedWallet;
        await selectAccount(walletIndex, index);
        push("/");
    }

    function handleAddAccount() {
        push('/add-account');
    }

    async function handleDeleteAccount(index: number) {
        try {
            const account = accounts[index];
            await destroyAccount(account.addr, $globalStore.selectedWallet);
        } catch (e) {
            console.error(e);
        }
    }
</script>

<div class="page-container">
    <NavBar title={$_('accounts.title')} />

    <main class="content">
        {#if currentWallet && currentChain}
            <WalletInfoCard
                iconSrc={viewChain({
                    network: currentChain,
                    theme: $globalStore.appearances
                })}
                subtitle={currentWallet.walletName}
                title={currentChain.name}
                onclick={() => {
                    push("/wallet");
                }}
            />
        {/if}

        <div class="accounts-list">
            {#each accounts as account, index (account.pubKey)}
                <AccountCard
                    name={account.name}
                    address={account.addr}
                    selected={index === selectedAccountIndex}
                    onclick={() => handleAccountSelect(index)}
                    showDelete={true}
                    disableDelete={index === 0}
                    ondelete={() => handleDeleteAccount(index)}
                />
            {/each}
        </div>
    </main>

    {#if currentWallet.walletType != WalletTypes.SecretKey}
        <footer class="footer">
            <Button variant="outline" onclick={handleAddAccount}>
                <PlusIcon />
            </Button>
        </footer>
    {/if}
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
        gap: 24px;
        padding: var(--padding-side) var(--padding-side);
        overflow-y: auto;
        min-height: 0;
    }

    .accounts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .footer {
        padding: 24px var(--padding-side) calc(16px + env(safe-area-inset-bottom));

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }
</style>
