<script lang="ts">
    import { _ } from 'popup/i18n';
    import { push } from 'popup/router/navigation';
    import NavBar from '../components/NavBar.svelte';
    import OptionCard from '../components/OptionCard.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import ArrowDownIcon from '../components/icons/ArrowDown.svelte';
    import LedgerIcon from '../components/icons/Ledger.svelte';
    import EyeIcon from '../components/icons/Eye.svelte';

    const mainOptions = [
        {
            id: 'new-wallet',
            titleKey: 'newWalletOptions.newWallet.title',
            descriptionKey: 'newWalletOptions.newWallet.description',
            icon: PlusIcon,
            disabled: false,
            action: () => handleNewWallet()
        },
        {
            id: 'existing-wallet',
            titleKey: 'newWalletOptions.existingWallet.title',
            descriptionKey: 'newWalletOptions.existingWallet.description',
            icon: ArrowDownIcon,
            disabled: false,
            action: () => handleExistingWallet()
        },
        {
            id: 'pair-ledger',
            titleKey: 'newWalletOptions.pairWithLedger.title',
            descriptionKey: 'newWalletOptions.pairWithLedger.description',
            icon: LedgerIcon,
            disabled: true,
            action: () => handlePairLedger()
        }
    ];

    const otherOptions = [
        {
            id: 'watch-account',
            titleKey: 'newWalletOptions.watchAccount.title',
            descriptionKey: 'newWalletOptions.watchAccount.description',
            icon: EyeIcon,
            disabled: true,
            action: () => handleWatchAccount()
        }
    ];

    function handleNewWallet() {
        push('/generate-wallet');
    }

    function handleExistingWallet() {
        push('/restore-wallet');
    }

    function handlePairLedger() {
        push('/new-wallet/ledger');
    }

    function handleWatchAccount() {
        push('/new-wallet/watch');
    }
</script>

<div class="page-container new-wallet-options">
    <NavBar title={$_('newWalletOptions.title')} />

    <div class="options-container">
        <div class="options-group">
            {#each mainOptions as option}
                <OptionCard
                    title={$_(option.titleKey)}
                    description={$_(option.descriptionKey)}
                    icon={option.icon}
                    disabled={option.disabled}
                    onclick={option.action}
                    showArrow={true}
                />
            {/each}
        </div>

        <div class="other-section">
            <h4 class="section-title">{$_('newWalletOptions.otherOptions')}</h4>
            <div class="options-group">
                {#each otherOptions as option}
                    <OptionCard
                        title={$_(option.titleKey)}
                        description={$_(option.descriptionKey)}
                        icon={option.icon}
                        disabled={option.disabled}
                        onclick={option.action}
                        showArrow={true}
                    />
                {/each}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .new-wallet-options {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--color-neutral-background-base);
        padding: 0 16px;
        box-sizing: border-box;
    }

    .options-container {
        padding-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 32px;
        overflow-y: auto;
    }

    .options-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .other-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .section-title {
        font-size: var(--font-size-large);
        color: var(--color-content-text-secondary);
        font-weight: 500;
        margin: 0;
    }
</style>


