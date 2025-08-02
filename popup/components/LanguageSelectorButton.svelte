<script lang="ts">
	import { push } from '../router/navigation';
	import LanguageIcon from '../components/icons/Language.svelte';

	function openLocalePage() {
		push('/locale');
	}
</script>

<button class="language-selector" on:click={openLocalePage}>
	<LanguageIcon width={28} height={28} />
</button>

<style lang="scss">
	.language-selector {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid var(--modal-border);
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.2);
			box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
		}
	}
</style>
