<script lang="ts">
	import { _ } from 'popup/i18n';

	import BottomTabs from '../components/BottomTabs.svelte';
	import TopBar from '../components/TopBar.svelte';
</script>

<section>
	<TopBar
    refresh
    view
    lock
	/>
	<main>
    <h1>
      {$_('swap.title')}
    </h1>
	</main>
	<BottomTabs />
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
    height: calc(100vh - 86px);
		@include flex-center-column;
	}
  h1 {
    font-size: 7vw;
  }
  section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
