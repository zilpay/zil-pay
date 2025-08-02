<script lang="ts">
	import NavBar from '../components/NavBar.svelte';
	import WordCountSelector from '../components/WordCountSelector.svelte';
	import Button from '../components/Button.svelte';
	import { _ } from 'popup/i18n';
	import { push, pop } from '../router/navigation';
	import CopyIcon from '../components/icons/BincodeIcon.svelte';
	import CheckIcon from '../components/icons/QRCodeIcon.svelte';
	import ReloadButton from '../components/ReloadButton.svelte';

	let wordCount = 12;
	let phrase: string[] = [];
	let hasBackup = false;
	let copied = false;

	async function generateWords() {
		const raw = await genMnemonic(wordCount);
		phrase = raw.trim().split(/\s+/);
		hasBackup = false;
		copied = false;
	}

	async function handleCopy() {
		await navigator.clipboard.writeText(phrase.join(' '));
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function handleCountChange(count: number) {
		wordCount = count;
		generateWords();
	}

	function toggleCheckbox() {
		hasBackup = !hasBackup;
	}

	function handleNext() {
		if (hasBackup) {
			push('/verify_bip39');
		}
	}

	function genMnemonic(count: number): Promise<string> {
		// Replace this with actual WASM or native API
		const mnemonics = Array.from({ length: count }, (_, i) => `word${i + 1}`);
		return Promise.resolve(mnemonics.join(' '));
	}

	$effect(() => {
		generateWords();
	});
</script>

<div class="bip39-page">
	<NavBar
		title={$_('generateWallet.bip39.title')}
		onBack={pop}
		rightIcon={ReloadButton}
		onRight={generateWords}
	/>

	<div class="content">
		<WordCountSelector selected={wordCount} onSelect={handleCountChange} />

		<div class="phrase-list">
			{#each phrase as word, i}
				<div class="mnemonic-word">
					<span class="index">{i + 1}.</span>
					<span class="word">{word}</span>
				</div>
			{/each}
		</div>

		<div class="row">
			<label class="checkbox-wrapper">
				<input type="checkbox" bind:checked={hasBackup} />
				<span>{$_('generateWallet.bip39.checkbox')}</span>
			</label>
			<button class="copy-btn" on:click={handleCopy}>
				{#if copied}
					<CheckIcon width="20" height="20" />
				{:else}
					<CopyIcon width="20" height="20" />
				{/if}
			</button>
		</div>

		<Button on:click={handleNext} disabled={!hasBackup}>
			{$_('generateWallet.bip39.next')}
		</Button>
	</div>
</div>

<style lang="scss">
	.bip39-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--background-color);
		padding: 0 20px;
		box-sizing: border-box;
		color: var(--text-primary);
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
		padding-bottom: 20px;
	}

	.phrase-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px 0;
	}

	.mnemonic-word {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		color: var(--text-secondary);
		background: var(--card-background);
		border-radius: 8px;
		padding: 10px 12px;
		opacity: 0.6;
	}

	.index {
		font-weight: 500;
		color: var(--text-secondary);
	}

	.word {
		font-weight: bold;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.checkbox-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--text-secondary);

		input[type='checkbox'] {
			accent-color: var(--primary-purple);
		}
	}

	.copy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
		border: none;
		background: var(--card-background);
		border-radius: 8px;
		cursor: pointer;
	}
</style>
