<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';

</script>

<main
in:fly={flyTransition.in}
out:fly={flyTransition.out}
>
<h1>Create!</h1>
</main>

<style type="text/scss">
</style>
