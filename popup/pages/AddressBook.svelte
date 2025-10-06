<script lang="ts">
    import { _ } from 'popup/i18n';
    import { push } from 'popup/router/navigation';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';

    import NavBar from '../components/NavBar.svelte';
    import AddressBookItem from '../components/AddressBookItem.svelte';
    import DeleteIcon from '../components/icons/Delete.svelte';
    import PlusIcon from '../components/icons/Plus.svelte';
    import type { IAddressBookRecord } from 'background/storage/book';
    import Modal from '../components/Modal.svelte';
    import AddAddressBook from '../modals/AddAddressBook.svelte';

    let showAddModal = $state(false);
    let book = $derived($globalStore.book);

    function handleSelect(addr: string) {
        push(`/transfer?addr=${addr}`);
    }

    async function handleDelete(recordToDelete: IAddressBookRecord) {
        globalStore.update(state => {
            state.book = state.book.filter(
                record => record.address !== recordToDelete.address
            );
            return state;
        });

        await setGlobalState();
    }
</script>

<div class="page-container">
    <NavBar title={$_('settings.addressBook')}>
        {#snippet right()}
            <button
              class="add-button"
              onclick={() => showAddModal = true}
            >
                <PlusIcon />
            </button>
        {/snippet}
    </NavBar>

    <main class="content">
        {#if book && book.length > 0}
            <div class="address-list">
                {#each book as record (record.address)}
                    <div class="list-item-wrapper">
                        <AddressBookItem 
                            {record}
                            onselect={handleSelect}
                        />
                        <button 
                            class="delete-button" 
                            onclick={() => handleDelete(record)}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="empty-state">
                <p>{$_('addressBook.empty')}</p>
            </div>
        {/if}
    </main>
</div>

<Modal bind:show={showAddModal} title={$_('addressBook.add.title')}>
    <AddAddressBook onsuccess={() => showAddModal = false} />
</Modal>


<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--color-neutral-background-base);
        padding: 0 ;
        box-sizing: border-box;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        padding: 24px 0;
        margin-top: var(--padding-side, 20px);
        padding: 16px;
    }

    .address-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .list-item-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .delete-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        background: none;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        color: var(--color-content-icon-secondary);
        transition: background-color 0.2s, color 0.2s;

        &:hover {
            color: var(--color-content-text-pink);
            background-color: var(--color-button-regular-quaternary-hover);
        }

        :global(svg) {
            width: 20px;
            height: 20px;
        }
    }

    .add-button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        color: var(--color-content-text-inverted);
        border-radius: 50%;
        transition: background-color 0.2s ease;

        :global(svg) {
            width: 24px;
            height: 24px;
        }
    }

    .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--color-content-text-secondary);
        font-size: var(--font-size-large);
    }
</style>
