<script lang="ts">
  let { selected = false, ...rest } = $props<{ selected?: boolean; [key: string]: any }>();
</script>

<svg
  {...rest}
  viewBox="0 0 24 24"
  fill="none"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle
    cx="12"
    cy="12"
    r="10"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></circle>
  <polyline
    points="12 6 12 12 16 14"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></polyline>
</svg>
