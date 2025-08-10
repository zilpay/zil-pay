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
  <polyline
    points="16 3 21 3 21 8"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></polyline>
  <line
    x1="4"
    y1="20"
    x2="21"
    y2="3"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></line>
  <polyline
    points="8 21 3 21 3 16"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></polyline>
  <line
    x1="20"
    y1="4"
    x2="3"
    y2="21"
    stroke={selected ? 'var(--primary-purple)' : 'var(--text-secondary)'}
  ></line>
</svg>
