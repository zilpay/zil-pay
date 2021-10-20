<script lang="ts">
	import Router from 'svelte-spa-router';
  import routes from './routers';

	import { Wallet } from "popup/backend";

	new Wallet().getState().then(console.log);
</script>

<Router {routes} />
