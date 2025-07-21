<script lang="ts">
	import { matchRoute, notFoundRoute, parseUrlParams, routes } from './router';
	import { RouteGuard } from './router/guard';
	import { currentParams, currentRoute } from './store/route';

	export function findRouteByHash(hash: string) {
		const path = hash.replace('#', '').replace(/^\//, '/');
		const found = matchRoute(path, routes);

		if (found) {
			return found;
		}

		return notFoundRoute;
	}

	function handleRouteChange() {
		const path = window.location.hash.slice(1) || '/';
		const route = findRouteByHash(path);
		const params = parseUrlParams(route.path, path);

		currentParams.set(params);

		if (route) {
			const guardedRoute = RouteGuard.checkRoute(route);
			currentRoute.set(guardedRoute);
		} else {
			currentRoute.set(notFoundRoute);
		}
	}

	$effect(() => {
		handleRouteChange();
		window.addEventListener('hashchange', handleRouteChange);
		return () => {
			window.removeEventListener('hashchange', handleRouteChange);
		};
	});

	const Component = $derived($currentRoute?.component);
</script>

{#if Component}
	<Component {...$currentParams} />
{/if}
