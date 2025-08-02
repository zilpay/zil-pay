<script lang="ts">
	import NavBar from 'popup/components/NavBar.svelte';
	import WordLengthSelector from 'popup/components/Bip39/WordLengthSelector.svelte';
	import WordList from 'popup/components/Bip39/WordList.svelte';
	import BackupCheckbox from 'popup/components/Bip39/BackupCheckbox.svelte';
	import NavigationButton from 'popup/components/Bip39/NavigationButton.svelte';
	import RefreshIcon from 'popup/components/icons/Close.svelte';

	import { _ } from 'popup/i18n';
	import { pop } from 'popup/router/navigation';

	let wordCount = 12;
	let hasBackup = false;

	let words = Array.from({ length: wordCount }, (_, i) => `${i + 1} word`);

	function handleWordCountChange(count: number) {
		wordCount = count;
		words = Array.from({ length: wordCount }, (_, i) => `${i + 1} word`);
	}

	function refreshWords() {
		words = Array.from({ length: wordCount }, (_, i) => `${i + 1} refreshed`);
	}
</script>

<div class="bip39-generate">
	<NavBar
		title={$_('generateWallet.bip39.title')}
		onBack={pop}
		rightIcon={RefreshIcon}
		onRight={refreshWords}
	/>

	<div class="content">
		<WordLengthSelector selected={wordCount} onSelect={handleWordCountChange} />

		<WordList {words} />

		<BackupCheckbox bind:checked={hasBackup} />

		<NavigationButton disabled={!hasBackup} />
	</div>
</div>

<style lang="scss">
	.bip39-generate {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: var(--background-color);
		color: var(--text-primary);
		padding: 0 20px;
		box-sizing: border-box;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		gap: 16px;
		padding-bottom: 16px;
	}
</style>
