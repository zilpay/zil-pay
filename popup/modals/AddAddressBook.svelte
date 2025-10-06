<script lang="ts">
    import { _ } from 'popup/i18n';
    import { setGlobalState } from 'popup/background/wallet';
    import globalStore from 'popup/store/global';
    
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';
    import { AddressType } from 'config/wallet';

    let {
        onsuccess
    }: {
        onsuccess: () => void;
    } = $props();

    let name = $state('');
    let address = $state('');
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    const isFormValid = $derived(
        name.trim().length > 0 && address.trim().length > 0
    );

    async function handleAddContact(event: SubmitEvent) {
        event.preventDefault();
        if (!isFormValid || isLoading) return;
        
        isLoading = true;
        error = null;

        try {
            let addrType: AddressType;

            if (address.startsWith('0x')) {
                addrType = AddressType.EthCheckSum; 
            } else if (address.startsWith('zil1')) {
                addrType = AddressType.Bech32; 
            } else {
                throw new Error("invalid address");                
            }

            const newRecord = {
                addrType,
                name: name.trim(),
                address: address,
            };

            globalStore.update(state => {
                if (!state.book) {
                    state.book = [newRecord];
                } else {
                    state.book.push(newRecord);
                }
                return state;
            });
            
            await setGlobalState();
            onsuccess();
        } catch (err) {
            error = String(err);
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        if (name || address) {
            error = null;
        }
    });

</script>

<div class="add-contact-container">
    <p class="description">
        {$_('addressBook.modal.description')}
    </p>

    <form class="form" onsubmit={handleAddContact}>
        <SmartInput
            bind:value={address}
            placeholder={$_('addressBook.modal.addressPlaceholder')}
            hide={false}
            showToggle={false}
            disabled={isLoading}
            hasError={!!error}
            errorMessage={error ?? ''}
        />
        <SmartInput
            bind:value={name}
            placeholder={$_('addressBook.modal.namePlaceholder')}
            hide={false}
            showToggle={false}
            disabled={isLoading}
            autofocus={true}
        />
        <div class="action-button">
            <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                loading={isLoading}
            >
                {$_('addressBook.modal.addButton')}
            </Button>
        </div>
    </form>
</div>

<style lang="scss">
    .add-contact-container {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .description {
        font-size: var(--font-size-large);
        color: var(--color-content-text-secondary);
        margin: 0;
        text-align: center;
        line-height: 1.5;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .action-button {
        margin-top: 8px;
    }
</style>
