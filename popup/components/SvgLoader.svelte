<script lang="ts">
  import { onMount } from 'svelte';

  import { uuidv4 } from 'lib/crypto/uuid';

  export let src;
  export let width = null;
  export let height = null;
  export let className = '';

  let ref;

  onMount(async() => {
    const res = await fetch(src);
    const content = await res.text();
    const id = uuidv4();
    const xmlns = 'xmlns="http://www.w3.org/2000/svg"';

    ref.parentNode.innerHTML = content.replace(xmlns, `id="${id}"`);
    ref = document.getElementById(id);

    if (width) {
      ref.setAttribute('width', width);
    }
    if (height) {
      ref.setAttribute('height', height);
    }
    if (className) {
      ref.classList.add(className);
    }
  });
</script>

<svg bind:this={ref}/>

<style lang="scss">
  @import "../styles/mixins";
</style>
