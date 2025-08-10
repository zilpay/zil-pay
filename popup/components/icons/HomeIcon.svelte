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
  <path
    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></path>
  <polyline
    points="9 22 9 12 15 12 15 22"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></polyline>
</svg>
