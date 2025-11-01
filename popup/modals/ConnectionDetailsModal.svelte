<script lang="ts">
    import { _ } from 'popup/i18n';
    import Modal from '../components/Modal.svelte';
    import Button from '../components/Button.svelte';
    import DeleteIcon from '../components/icons/Delete.svelte';
    import SuccessIcon from '../components/icons/Success.svelte';
    import LinkIcon from '../components/icons/Link.svelte';
    import FastImg from '../components/FastImg.svelte';
    import Jazzicon from '../components/Jazzicon.svelte';
    import type { IWeb3ConnectionState } from 'background/storage/connections';

    let {
        show = $bindable(false),
        connection,
        ondelete = () => {}
    }: {
        show?: boolean;
        connection: IWeb3ConnectionState | null;
        ondelete?: () => void;
    } = $props();

    let confirmDelete = $state(false);

    function handleDeleteClick() {
        if (confirmDelete) {
            ondelete();
            confirmDelete = false;
        } else {
            confirmDelete = true;
        }
    }

    function resetConfirmState() {
        confirmDelete = false;
    }

    $effect(() => {
        if (!show) resetConfirmState();
    });

    const permissionLabels: Record<string, string> = {
        signTransactions: 'Sign Transactions',
        signMessages: 'Sign Messages',
        readChainData: 'Read Chain Data'
    };

    function normalizeDomain(domain?: string): string {
        const raw = (domain ?? '').trim();
        if (!raw) return '';
        const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            return new URL(url).href;
        } catch {
            return '';
        }
    }

    const siteUrl = $derived(normalizeDomain(connection?.domain));
</script>

<Modal bind:show title={connection ? (connection.title || connection.domain) : ''}>
    {#if connection}
        <div class="connection-details-container">
            <div class="header-section">
                <div class="icon-wrapper">
                    {#if connection.icon}
                        <FastImg src={connection.icon} alt={connection.title} />
                    {:else}
                        <Jazzicon seed={connection.origin} diameter={48} />
                    {/if}
                </div>
                <h2 class="site-title">{connection.title || connection.domain}</h2>

                {#if siteUrl}
                    <a
                        class="site-link"
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open website"
                    >
                        <LinkIcon />
                        <span>{connection.domain}</span>
                    </a>
                {/if}
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <span class="info-label">{$_('connections.connectedAccounts')}</span>
                    <span class="info-value">{connection.connectedAccounts.length}</span>
                </div>
                <div class="info-card">
                    <span class="info-label">{$_('connections.connectedChains')}</span>
                    <span class="info-value">{connection.connectedChains.length}</span>
                </div>
            </div>

            <div class="date-section">
                <span class="date-label">{$_('connections.connectedAt')}</span>
                <span class="date-value">{new Date(connection.connectedAt).toLocaleString()}</span>
            </div>

            <div class="permissions-section">
                <h3 class="section-title">{$_('connections.permissions')}</h3>
                <div class="permissions-list">
                    {#each Object.entries(connection.permissions) as [key, value]}
                        {#if value && permissionLabels[key]}
                            <div class="permission-item">
                                <span class="permission-check">
                                    <SuccessIcon />
                                </span>
                                <span class="permission-text">{permissionLabels[key]}</span>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="action-section">
                <Button
              variant={confirmDelete ? 'primary' : 'outline'}
                    onclick={handleDeleteClick}
                >
                    {#if confirmDelete}
                        <SuccessIcon />
                        {$_('connections.confirmDisconnect')}
                    {:else}
                        <DeleteIcon />
                        {$_('connections.disconnect')}
                    {/if}
                </Button>
            </div>
        </div>
    {/if}
</Modal>

<style lang="scss">
    .connection-details-container {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .header-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-cards-regular-border-default);
    }

    .icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :global(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .site-title {
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;
        color: var(--color-content-text-inverted);
        margin: 0;
        text-align: center;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .site-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 8px;
        background: var(--color-button-regular-quaternary-default);
        border: 1px solid var(--color-cards-regular-border-default);
        color: var(--color-content-text-inverted);
        text-decoration: none;
        transition: background-color 0.2s ease, border-color 0.2s ease;

        &:hover {
            background: var(--color-button-regular-quaternary-hover);
            border-color: var(--color-cards-regular-border-hover);
        }

        :global(svg) {
            width: 18px;
            height: 18px;
            color: var(--color-content-icon-secondary);
        }

        span {
            font-size: var(--font-size-medium);
            line-height: 16px;
            color: var(--color-content-text-secondary);
        }
    }

    .info-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .info-card {
        flex: 1;
        min-width: 140px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 14px 8px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
        min-height: 70px;
    }

    .info-label {
        font-size: 11px;
        line-height: 14px;
        color: var(--color-content-text-secondary);
        text-align: center;
        word-wrap: break-word;
        max-width: 100%;
    }

    .info-value {
        font-size: 24px;
        font-weight: 700;
        line-height: 28px;
        color: var(--color-content-text-inverted);
    }

    .date-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .date-label {
        font-size: 12px;
        line-height: 16px;
        color: var(--color-content-text-secondary);
    }

    .date-value {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-content-text-inverted);
    }

    .permissions-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--color-content-text-inverted);
        margin: 0;
    }

    .permissions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .permission-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 8px;
    }

    .permission-check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: var(--color-positive-text-primary);
        color: var(--color-neutral-background-base);
        border-radius: 50%;
        flex-shrink: 0;

        :global(svg) {
            width: 14px;
            height: 14px;
        }
    }

    .permission-text {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-content-text-inverted);
    }

    .action-section {
        margin-top: 8px;

        :global(button) {
            width: 100%;

            :global(svg) {
                width: 20px;
                height: 20px;
            }
        }
    }
</style>
