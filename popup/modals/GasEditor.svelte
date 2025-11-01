<script lang="ts">
    import { _ } from 'popup/i18n';
    import type { RequiredTxParams } from 'types/gas';
    import Modal from '../components/Modal.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import Button from '../components/Button.svelte';

    let {
        show = $bindable(false),
        gasParams,
        onSave = (_params: RequiredTxParams) => {}
    }: {
        show?: boolean;
        gasParams: RequiredTxParams | null;
        onSave?: (params: RequiredTxParams) => void;
    } = $props();

    let gasPrice = $state('');
    let maxPriorityFee = $state('');
    let gasLimit = $state('');
    let nonce = $state('');

    $effect(() => {
        if (show && gasParams) {
            gasPrice = gasParams.gasPrice.toString();
            maxPriorityFee = gasParams.maxPriorityFee.toString();
            gasLimit = gasParams.txEstimateGas.toString();
            nonce = gasParams.nonce.toString();
        }
    });

    const isValid = $derived(() => {
        try {
            if (!gasPrice || !maxPriorityFee || !gasLimit || !nonce) return false;
            BigInt(gasPrice);
            BigInt(maxPriorityFee);
            BigInt(gasLimit);
            parseInt(nonce);
            return true;
        } catch {
            return false;
        }
    });

    function handleClose() {
        show = false;
    }

    function handleSave() {
        if (!isValid() || !gasParams) return;

        const updatedParams: RequiredTxParams = {
            ...gasParams,
            gasPrice: BigInt(gasPrice),
            maxPriorityFee: BigInt(maxPriorityFee),
            txEstimateGas: BigInt(gasLimit),
            nonce: parseInt(nonce)
        };

        onSave(updatedParams);
        show = false;
    }
</script>

<Modal bind:show title={$_('gasEditor.title')} onClose={handleClose}>
    <div class="gas-editor">
        <SmartInput
            id="gas-price"
            label={$_('gasEditor.gasPrice')}
            bind:value={gasPrice}
            placeholder="0"
            showToggle={false}
        />

        <SmartInput
            id="max-priority-fee"
            label={$_('gasEditor.maxPriorityFee')}
            bind:value={maxPriorityFee}
            placeholder="0"
            showToggle={false}
        />

        <SmartInput
            id="gas-limit"
            label={$_('gasEditor.gasLimit')}
            bind:value={gasLimit}
            placeholder="0"
            showToggle={false}
        />

        <SmartInput
            id="nonce"
            label={$_('gasEditor.nonce')}
            bind:value={nonce}
            placeholder="0"
            showToggle={false}
        />

        <div class="actions">
            <Button variant="outline" onclick={handleClose}>
                {$_('gasEditor.cancel')}
            </Button>
            <Button onclick={handleSave} disabled={!isValid()}>
                {$_('gasEditor.save')}
            </Button>
        </div>
    </div>
</Modal>

<style lang="scss">
    .gas-editor {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
    }

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
    }
</style>
