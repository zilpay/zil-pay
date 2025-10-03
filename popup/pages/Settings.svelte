<script lang="ts">
    import { _ } from 'popup/i18n';
    import { push } from '../router/navigation';
    import globalStore from 'popup/store/global';
    import { viewChain } from 'lib/popup/url';
    import { getAccountChain, getWalletChain } from 'popup/mixins/chains';
    import WalletInfoCard from '../components/WalletInfoCard.svelte';

    import Header from '../components/Header.svelte';
    import BottomTabs from '../components/BottomTabs.svelte';
    import SettingsItem from '../components/SettingsItem.svelte';

    import CurrencyIcon from '../components/icons/Currency.svelte';
    import AppearanceIcon from '../components/icons/Appearance.svelte';
    import NotificationIcon from '../components/icons/Notification.svelte';
    import ContactsIcon from '../components/icons/Contacts.svelte';
    import ShieldIcon from '../components/icons/Shield.svelte';
    import ConnectionIcon from '../components/icons/Connection.svelte';
    import LanguageIcon from '../components/icons/Planet.svelte';
    import TgLogo from '../components/icons/TgLogo.svelte';
    import XLogo from '../components/icons/XLogo.svelte';
    import GithubLogo from '../components/icons/GithubLogo.svelte';
    import InfoIcon from '../components/icons/Info.svelte';

    const generalSettings = [
        { id: 'currency', labelKey: 'settings.currency', Icon: CurrencyIcon, path: '/currency' },
        { id: 'appearance', labelKey: 'settings.appearance', Icon: AppearanceIcon, path: '/appearance' },
        { id: 'notifications', labelKey: 'settings.notifications', Icon: NotificationIcon, path: '/settings/notifications' },
        { id: 'address_book', labelKey: 'settings.addressBook', Icon: ContactsIcon, path: '/settings/address-book' }
    ];

    const securitySettings = [
        { id: 'security', labelKey: 'settings.security', Icon: ShieldIcon, path: '/settings/security' },
        { id: 'networks', labelKey: 'settings.networks', Icon: ConnectionIcon, path: '/networks' },
        { id: 'language', labelKey: 'settings.language', Icon: LanguageIcon, path: '/locale' }
    ];

    const aboutSettings = [
        { id: 'telegram', labelKey: 'settings.telegram', Icon: TgLogo, path: 'https://t.me/zilpaychat' },
        { id: 'twitter', labelKey: 'settings.twitter', Icon: XLogo, path: 'https://x.com/pay_zil' },
        { id: 'github', labelKey: 'settings.github', Icon: GithubLogo, path: 'https://github.com/zilpay/zil-pay' },
        { id: 'about', labelKey: 'settings.about', Icon: InfoIcon, path: '/settings/about' }
    ];

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    const walletChain = $derived(getWalletChain($globalStore.selectedWallet));

    function handleNavigation(path: string) {
        if (path.startsWith('http')) {
            window.open(path, '_blank');
        } else {
            push(path);
        }
    }
</script>

<div class="page-container">
    <Header
        showNetworkButton={true}
        networkImageSrc={viewChain({
            network: walletChain,
            theme: $globalStore.appearances
        })}
        networkImageAlt={walletChain?.name || 'Network'}
    />

    <main class="content">
        {#if currentWallet && currentAccount}
            <WalletInfoCard
                onclick={() => {
                    push("/wallet");
                }}
                iconSrc={viewChain({
                    network: getAccountChain($globalStore.selectedWallet),
                    theme: $globalStore.appearances
                })}
                subtitle={currentWallet.walletName}
                title={getAccountChain($globalStore.selectedWallet)?.name ?? ""}
            />
        {/if}

        <div class="settings-group">
            {#each generalSettings as item, index (item.id)}
                <div class="item-wrapper" class:no-divider={index === generalSettings.length - 1}>
                    <SettingsItem 
                        label={$_(item.labelKey)} 
                        Icon={item.Icon} 
                        onclick={() => handleNavigation(item.path)} 
                    />
                </div>
            {/each}
        </div>

        <div class="settings-group">
            {#each securitySettings as item, index (item.id)}
                <div class="item-wrapper" class:no-divider={index === securitySettings.length - 1}>
                    <SettingsItem 
                        label={$_(item.labelKey)} 
                        Icon={item.Icon} 
                        onclick={() => handleNavigation(item.path)} 
                    />
                </div>
            {/each}
        </div>

        <div class="settings-group">
            {#each aboutSettings as item, index (item.id)}
                <div class="item-wrapper" class:no-divider={index === aboutSettings.length - 1}>
                    <SettingsItem 
                        label={$_(item.labelKey)} 
                        Icon={item.Icon} 
                        onclick={() => handleNavigation(item.path)} 
                    />
                </div>
            {/each}
        </div>
    </main>

    <BottomTabs />
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--color-neutral-background-base);
        padding: 0;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        padding: 24px 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 0 var(--padding-side, 20px);
    }

    .settings-group {
        padding: 4px 12px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }

    .item-wrapper {
        border-bottom: 1px solid var(--color-cards-regular-border-default);
    }

    .item-wrapper.no-divider {
        border-bottom: none;
    }
</style>
