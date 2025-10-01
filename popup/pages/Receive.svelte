<script lang="ts">
    import { onMount } from 'svelte';
    import { _ } from 'popup/i18n';
    import { generate } from 'lean-qr';
    import globalStore from 'popup/store/global';
    import { clipboardCopy } from 'lib/popup/clipboard';
    import { Message } from 'lib/streem/message';
    import { getGlobalState, setGlobalState } from 'popup/background/wallet';

    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import FastImg from '../components/FastImg.svelte';
    import InfoIcon from '../components/icons/Info.svelte';
    import DownIcon from '../components/icons/Down.svelte';
    import EditIcon from '../components/icons/Edit.svelte';
    import CopyIcon from '../components/icons/Copy.svelte';
    import BillIcon from '../components/icons/Bill.svelte';
    import ScillaIcon from '../components/icons/Scilla.svelte';
    import Solidityicon from '../components/icons/Solidity.svelte';
    import ShareIcon from '../components/icons/Share.svelte';
    import SuccessIcon from '../components/icons/Success.svelte';
    import { processTokenLogo } from 'lib/popup/url';

    let canvasElement: HTMLCanvasElement;
    let accountName = $state('');
    let isCopied = $state(false);

    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const currentAccount = $derived(currentWallet?.accounts[currentWallet.selectedAccount]);
    const nativeToken = $derived(currentWallet?.tokens.find(t => t.native));
    const logo = $derived(nativeToken ? processTokenLogo({
        token: nativeToken,
        theme: $globalStore.appearances,
    }) : '');

    function handleCopy() {
        if (currentAccount?.addr && !isCopied) {
            clipboardCopy(currentAccount.addr);
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 2000);
        }
    }

    async function handleShare() {
        if (navigator.share && currentAccount?.addr) {
            try {
                await navigator.share({
                    title: currentAccount.name,
                    text: currentAccount.addr,
                });
            } catch (error) {
                console.error('Error sharing', error);
            }
        }
    }

    async function hanlderInputWalletName(event: Event) {
        event.preventDefault();
        if (!currentAccount || !currentWallet) return;

        const newName = accountName.trim();
        if (!newName || newName === currentAccount.name) {
            accountName = currentAccount.name;
            return;
        }

        try {
            let state = $globalStore;
            let wallet = state.wallets[state.selectedWallet]; 

            wallet.accounts[wallet.selectedAccount].name = newName;
            globalStore.set(state);

            await setGlobalState();
            const input = (event.target as HTMLFormElement).querySelector('input');
            if (input) input.blur();
        } catch (error) {
            console.error('Failed to update account name:', error);
            accountName = currentAccount.name;
        }
    }
    
    $effect(() => {
        if (currentAccount) {
            accountName = currentAccount.name;
        }
    });

    onMount(() => {
        if (canvasElement && currentAccount?.addr) {
            const code = generate(currentAccount.addr);
            code.toCanvas(canvasElement, {
                on: [255, 0, 122, 255],
                off: [0, 0, 0, 0],
                pad: 0
            });
        }
    });
</script>

<div class="page-container">
    <NavBar title={$_('receive.title')} />

    <div class="content">
        <div class="info-banner">
            <InfoIcon />
            <p>{$_('receive.warning')}</p>
        </div>

        <div class="qr-card">
            <button class="token-selector">
                {#if nativeToken}
                    <div class="token-icon">
                        <FastImg src={logo} alt={nativeToken.symbol} />
                    </div>
                    <span>{nativeToken.name} ({nativeToken.symbol})</span>
                {/if}
                <DownIcon />
            </button>
            <div class="canvas-container">
                <canvas bind:this={canvasElement}></canvas>
            </div>
            <p class="address-text">{currentAccount?.addr}</p>
        </div>

        <form class="account-name-input" onsubmit={hanlderInputWalletName}>
            <SmartInput bind:value={accountName} hide={false} showToggle={false}>
                {#snippet rightAction()}
                    <button type="submit" class="edit-button">
                        <EditIcon />
                    </button>
                {/snippet}
            </SmartInput>
        </form>

        <div class="actions-grid">
            <button class="action-button" onclick={handleCopy}>
                {#if isCopied}
                    <SuccessIcon />
                {:else}
                    <CopyIcon />
                {/if}
            </button>
            <button class="action-button">
                <BillIcon />
            </button>
            <button class="action-button">
                <ScillaIcon />
                <Solidityicon />
            </button>
            <button class="action-button" onclick={handleShare}>
                <ShareIcon />
            </button>
        </div>
    </div>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        box-sizing: border-box;
        padding: 0;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: var(--padding-side, 20px) var(--padding-side, 20px);
        flex: 1;
        min-height: 0;
    }

    .info-banner {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
        background: var(--color-notification-neutral-background, white);
        border-radius: 16px;
        outline: 1px solid var(--color-notification-neutral-border);
        outline-offset: -1px;

        :global(svg) {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            color: var(--color-notification-neutral-content);
        }

        p {
            flex: 1 1 0;
            color: var(--color-content-text-inverted);
            font-size: 12px;
            font-family: Geist;
            font-weight: 400;
            line-height: 16px;
        }
    }

    .qr-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
    }

    .token-selector {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-content-text-inverted);
        font-size: 16px;
        font-family: Geist;
        font-weight: 400;
        line-height: 22px;
    }

    .token-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
    }
    
    .canvas-container {
        width: 166px;
        height: 166px;

        canvas {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
        }
    }

    .address-text {
        color: var(--color-content-text-inverted);
        font-size: 14px;
        font-family: Geist;
        font-weight: 400;
        line-height: 20px;
        word-break: break-all;
        text-align: center;
    }
    
    .edit-button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        
        :global(svg) {
            color: var(--color-content-icon-secondary);
        }
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-top: auto;
    }

    .action-button {
        height: 52px;
        background: var(--color-button-regular-quaternary-default);
        border-radius: 11px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;

        &:hover {
            background: var(--color-button-regular-quaternary-hover);
        }

        :global(svg) {
            width: 24px;
            height: 24px;
        }
        
        :global(.scilla > path),
        :global(.sol > path) {
            fill: var(--color-content-icon-accent-secondary);
        }
    }
</style>


