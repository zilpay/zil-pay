<script lang="ts">
    import { _ } from 'popup/i18n';
    import { currentParams } from 'popup/store/route';
    import globalStore from 'popup/store/global';
    import { push } from 'popup/router/navigation';
    import type { SignMesageReqScilla } from 'types/tx';
    import type { SignPersonalMessageEVM } from 'types/tx';
    import { responseToSignMessageScilla, responseToSignPersonalMessageEVM } from 'popup/background/sign-message';

    import AccountCard from '../components/AccountCard.svelte';
    import Button from '../components/Button.svelte';
    import DAppInfo from '../components/DAppInfo.svelte';
    import CopyButton from '../components/CopyButton.svelte';

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const selectedAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);

    const confirmRequests = $derived(currentWallet?.confirm ?? []);
    const signMessageRequest = $derived(
        confirmRequests.find(c => c.signMessageScilla !== undefined || c.signPersonalMessageEVM !== undefined)
    );
    const signMessageScillaData = $derived(signMessageRequest?.signMessageScilla as SignMesageReqScilla | undefined);
    const signPersonalMessageEVMData = $derived(signMessageRequest?.signPersonalMessageEVM as SignPersonalMessageEVM | undefined);

    const isEVM = $derived(!!signPersonalMessageEVMData);
    const isScilla = $derived(!!signMessageScillaData);

    const messageData = $derived({
        icon: isEVM ? signPersonalMessageEVMData?.icon : signMessageScillaData?.icon,
        title: isEVM ? signPersonalMessageEVMData?.title : signMessageScillaData?.title,
        domain: isEVM ? signPersonalMessageEVMData?.domain : signMessageScillaData?.domain,
        content: isEVM ? signPersonalMessageEVMData?.message : signMessageScillaData?.content,
    });

    async function handleConfirm() {
        try {
            if (signMessageRequest) {
                if (isScilla) {
                    await responseToSignMessageScilla(signMessageRequest.uuid, $globalStore.selectedWallet, currentWallet.selectedAccount, true);
                } else if (isEVM) {
                    await responseToSignPersonalMessageEVM(signMessageRequest.uuid, $globalStore.selectedWallet, currentWallet.selectedAccount, true);
                }
            }
        } catch(e) {
            if (String(e).includes("Session")) {
                if ($currentParams?.type === 'popup') {
                    window.close();
                } else {
                    push('/lock');
                }
            }
        }
    }

    async function handleCancel() {
        try {
            if (signMessageRequest) {
                if (isScilla) {
                    await responseToSignMessageScilla(signMessageRequest.uuid, $globalStore.selectedWallet, currentWallet.selectedAccount, false);
                } else if (isEVM) {
                    await responseToSignPersonalMessageEVM(signMessageRequest.uuid, $globalStore.selectedWallet, currentWallet.selectedAccount, false);
                }
            }
        } catch (e) {
            if (String(e).includes("Session")) {
                if ($currentParams?.type === 'popup') {
                    window.close();
                } else {
                    push('/lock');
                }
            }
        }
    }

    $effect(() => {
        if (!signMessageRequest) {
            if ($currentParams?.type === 'popup') {
                window.close();
            } else {
                push('/');
            }
        }
    });
</script>

{#if messageData && selectedAccount}
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
            icon={messageData.icon}
            title={messageData.title ?? ""}
            domain={messageData.domain ?? ""}
        />

        <div class="message-card">
            <div class="message-header">
                <span class="message-title">{$_('sign_message.message')}</span>
                <CopyButton value={messageData.content ?? ""} />
            </div>
            <div class="message-content">{messageData.content}</div>
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
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px var(--padding-side);
        overflow-y: auto;
        min-height: 0;
    }

    .title-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 4px;
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
        background: var(--color-cards-regular-base-default);
        border: 1px solid var(--color-cards-regular-border-default);
        border-radius: 12px;
    }

    .message-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .message-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
        color: var(--color-content-text-inverted);
    }

    .message-content {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        white-space: pre-wrap;
        word-break: break-word;
        background: var(--color-neutral-background-container);
        border-radius: 8px;
        padding: 12px;
        max-height: 240px;
        overflow-y: auto;
        font-family: Geist, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }

    .footer {
        padding: 16px var(--padding-side) calc(16px + env(safe-area-inset-bottom));
        background: var(--color-neutral-background-base);
        border-top: 1px solid var(--color-cards-regular-border-default);
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
