<script lang="ts">
    import { _ } from 'popup/i18n';
    import { currentParams } from 'popup/store/route';
    import globalStore from 'popup/store/global';
    import { push } from 'popup/router/navigation';
    import type { SignMesageReqScilla } from 'types/tx';
    import { responseToSignMessageScilla } from 'popup/background/sign-message';
    import { clipboardCopy } from 'lib/popup/clipboard';
    
    import AccountCard from '../components/AccountCard.svelte';
    import Button from '../components/Button.svelte';
    import DAppInfo from '../components/DAppInfo.svelte';
    import CopyIcon from '../components/icons/Copy.svelte';
    import SuccessIcon from '../components/icons/Success.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const selectedAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);

    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const signMessageRequest = $derived(
        confirmRequests.find(c => c.signMessageScilla !== undefined)
    );
    const signMessageData = $derived(signMessageRequest?.signMessageScilla as SignMesageReqScilla | undefined);

    let isCopied = $state(false);

    async function handleCopy() {
        if (isCopied || !signMessageData) return;

        const success = await clipboardCopy(signMessageData.content);
        if (success) {
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 1000);
        }
    }

    async function handleConfirm() {
        if (signMessageRequest) {
            await responseToSignMessageScilla(signMessageRequest.uuid, $globalStore.selectedWallet, currentWallet.selectedAccount,true);
        }
    }

    async function handleCancel() {
        if (signMessageRequest) {
            await responseToSignMessageScilla(signMessageRequest.uuid, $globalStore.selectedWallet, currentWallet.selectedAccount, false);
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
        <AccountCard
            name={selectedAccount.name}
            address={selectedAccount.addr}
            selected={false}
        />

        <div class="title-section">
            <h1 class="title">{$_('sign_message.title')}</h1>
            <p class="subtitle">{$_('sign_message.subtitle')}</p>
        </div>

        <DAppInfo
            icon={signMessageData.icon}
            title={signMessageData.title}
            domain={signMessageData.domain}
        />

        <div class="message-card">
            <div class="message-header">
                <span class="message-title">{$_('sign_message.message')}</span>
                <button class="copy-button" type="button" onclick={handleCopy}>
                    {#if isCopied}
                        <SuccessIcon width="20" height="20" />
                    {:else}
                        <CopyIcon width="20" height="20" />
                    {/if}
                </button>
            </div>

            <div class="message-content">
                {signMessageData.content}
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
        padding: 16px;
        overflow-y: auto;
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

    .copy-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
            background: var(--color-button-regular-quaternary-hover);
        }

        &:active {
            transform: scale(0.95);
        }

        :global(svg) {
            color: var(--color-content-icon-accent-secondary);
        }
    }

    .message-content {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        word-break: break-word;
        white-space: pre-wrap;
        max-height: 200px;
        overflow-y: auto;
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
