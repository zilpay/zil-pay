<script>
  import { onMount } from 'svelte';

  let { src, ...rest } = $props();
  let content = $state('');

  onMount(async () => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to fetch svg');
      content = await response.text();
    } catch (error) {
      console.error(error);
    }
  });
</script>

{@html content ? `<svg ${Object.entries(rest).map(([k, v]) => `${k}="${v}"`).join(' ')}>${content.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>` : ''}
