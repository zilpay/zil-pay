<script lang="ts">
  import Close from './icons/Close.svelte';

  let {
    title = '',
    onClose = () => window.history.back()
  } = $props();
</script>

<nav class="header-nav">
  <h1 class="header-title">{title}</h1>
  <button class="close-button" onclick={() => onClose()} aria-label="Close">
    <Close width={36} height={36} />
  </button>
</nav>

<style lang="scss">
  .header-nav {
  	display: flex;
  	justify-content: space-between;
  	align-items: center;
  	width: 100%;
  	padding: 20px 0;
  	box-sizing: border-box;
  }

  .header-title {
  	margin: 0;
  	font-size: 1.5rem;
  	font-weight: bold;
  	color: var(--text-primary);
  	text-align: center;
  	flex: 1;
  }

  .close-button {
  	background: none;
  	border: none;
  	padding: 0;
  	cursor: pointer;
  	transition: opacity 0.2s ease;
  }

  .close-button:hover {
  	opacity: 0.8;
  }

  .close-button:focus {
  	outline: 2px solid var(--primary-purple);
  	outline-offset: 2px;
  }
</style>
