<script lang="ts">
    import { _ } from 'popup/i18n';
    import { currentParams } from 'popup/store/route';
    import globalStore from 'popup/store/global';
    import { push } from 'popup/router/navigation';
    import type { SignMesageReqScilla } from 'types/tx';
    
    import AccountCard from '../components/AccountCard.svelte';
    import Button from '../components/Button.svelte';
    import InfoIcon from '../components/icons/Info.svelte';
    import CopyIcon from '../components/icons/Copy.svelte';
    import FullScreenIcon from '../components/icons/FullScreen.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const selectedAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);

    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const signMessageRequest = $derived(
        confirmRequests.find(c => c.signMessageScilla !== undefined)
    );
    const signMessageData = $derived(signMessageRequest?.signMessageScilla as SignMesageReqScilla | undefined);

    let isExpanded = $state(false);

    function toggleExpand() {
        isExpanded = !isExpanded;
    }

    async function handleCopy(text: string) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }

    async function handleConfirm() {
        if (signMessageRequest) {
            // await responseToSignMessage(signMessageRequest.uuid, $globalStore.selectedWallet, true);
        }
    }

    async function handleCancel() {
        if (signMessageRequest) {
            // await responseToSignMessage(signMessageRequest.uuid, $globalStore.selectedWallet, false);
        }
    }

    $effect(() => {
        if (!signMessageRequest) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push("/");
            }
        }
    });
</script>

{#if signMessageData && selectedAccount}
<div class="page-container">
    <main class="content">
        <div class="account-section">
            <AccountCard
                name={selectedAccount.name}
                address={selectedAccount.addr}
                selected={false}
            />
        </div>

        <div class="title-section">
            <h1 class="title">{$_('sign_message.title')}</h1>
            <p class="subtitle">{$_('sign_message.subtitle')}</p>
        </div>

        <div class="info-card">
            <div class="info-row">
                <div class="info-label">
                    <span>{$_('sign_message.request_from')}</span>
                    <button class="icon-button" type="button">
                        <InfoIcon width="16" height="16" />
                    </button>
                </div>
                <span class="info-value">{signMessageData.domain}</span>
            </div>

            <div class="info-row">
                <div class="info-label">
                    <span>{$_('sign_message.interacting_with')}</span>
                    <button class="icon-button" type="button">
                        <InfoIcon width="16" height="16" />
                    </button>
                </div>
                <span class="info-value">{signMessageData.hash.slice(0, 10)}...{signMessageData.hash.slice(-6)}</span>
            </div>
        </div>

        <div class="message-card">
            <div class="message-header">
                <span class="message-title">{$_('sign_message.message')}</span>
                <div class="message-actions">
                    <button class="icon-button" type="button" onclick={() => handleCopy(signMessageData.content)}>
                        <CopyIcon width="20" height="20" />
                    </button>
                    <button class="icon-button" type="button" onclick={toggleExpand}>
                        <FullScreenIcon width="20" height="20" />
                    </button>
                </div>
            </div>

            <div class="message-details">
                <div class="detail-row">
                    <span class="detail-label">{$_('sign_message.primary_type')}:</span>
                    <span class="detail-value">{signMessageData.title}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">{$_('sign_message.content')}:</span>
                    <span class="detail-value" class:expanded={isExpanded}>
                        {signMessageData.content}
                    </span>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="action-buttons">
            <Button variant="outline" onclick={handleCancel}>
                {$_('common.cancel')}
            </Button>
            <Button variant="primary" onclick={handleConfirm}>
                {$_('common.confirm')}
            </Button>
        </div>
    </footer>
</div>
{/if}

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-cards-navigation-base-default);
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-top: 8px;
        overflow-y: auto;
    }

    .account-section {
        background: var(--color-cards-regular-base-default);
        border-radius: 12px;
        padding: 8px;
        outline: 1px solid var(--color-neutral-border-default);
        outline-offset: -1px;
    }

    .title-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .title {
        font-size: 20px;
        font-weight: 700;
        line-height: 30px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .subtitle {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--color-content-text-secondary);
        margin: 0;
    }

    .info-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background: var(--color-neutral-background-base);
        border-radius: 12px;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--color-content-text-inverted);
    }

    .info-value {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        text-align: right;
    }

    .message-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background: var(--color-neutral-background-base);
        border-radius: 12px;
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .message-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
        color: var(--color-content-text-inverted);
    }

    .message-actions {
        display: flex;
        gap: 8px;
    }

    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.7;
        }

        &:active {
            opacity: 0.5;
        }
    }

    .message-details {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
    }

    .detail-label {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        flex-shrink: 0;
    }

    .detail-value {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;

        &.expanded {
            display: block;
            white-space: pre-wrap;
            word-break: break-word;
        }
    }

    .footer {
        padding: 16px;
        background: var(--color-cards-navigation-base-default);
        border-top: 1px solid var(--color-neutral-border-default);
    }

    .action-buttons {
        display: flex;
        gap: 8px;

        :global(button) {
            flex: 1;
            max-height: 48px;
        }
    }
</style>
