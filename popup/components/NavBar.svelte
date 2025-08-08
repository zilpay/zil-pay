<script lang="ts">
	import type { Snippet, SvelteComponent } from 'svelte';

	let {
		title = '',
		onBack = () => window.history.back(),
		onRight = null,
		rightIcon = null,
		left = null
	}: {
		title?: string;
		onBack?: () => void;
		onRight?: (() => void) | null;
		rightIcon?: (typeof SvelteComponent) | null;
		left?: Snippet | null;
	} = $props();
</script>

<nav class="nav-bar">
	<button
		class="nav-left-button"
		type="button"
		onclick={() => onBack()}
		aria-label="Back"
	>
		{#if left}
			{@render left()}
		{:else}
			<span class="arrow">←</span>
		{/if}
	</button>
	<h1 class="nav-title">{title}</h1>
	{#if rightIcon}
		<button
			class="nav-right-button"
			type="button"
			onclick={() => onRight && onRight()}
			aria-label="Action"
		>
			{#if typeof rightIcon === 'string'}
				<img src={rightIcon} alt="" />
			{:else}
				{@const Icon = rightIcon}
				<Icon />
			{/if}
		</button>
	{:else}
		<div class="nav-right-placeholder"></div>
	{/if}
</nav>

<style lang="scss">
  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 20px 0;
    box-sizing: border-box;
  }

  .nav-title {
    font-size: var(--font-size-xl);
    font-weight: bold;
    flex: 1;
    text-align: center;
    color: var(--text-primary);
    margin: 0;
  }

  .nav-left-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary);
    font-weight: bold;
    font-size: calc(var(--font-size-xl) * 1.33);
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .arrow {
    font-size: calc(var(--font-size-xl) * 1.33);
  }

  .nav-right-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: var(--text-primary);
  }

  .nav-right-placeholder {
    width: 36px;
    height: 36px;
  }
</style>

