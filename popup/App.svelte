<script lang="ts">
	import Router from 'svelte-spa-router';
  import routes from './routers';
</script>

<Router {routes} />

<style type="text/scss">
	@import "./styles/general";
</style>
