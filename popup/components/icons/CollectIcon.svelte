<script lang="ts">
  let { ...rest } = $props<{ selected?: boolean; [key: string]: any }>();
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
    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    stroke="var(--color-content-icon-primary)"
  ></path>
  <polyline
    points="7 10 12 15 17 10"
    stroke="var(--color-content-icon-primary)"
  ></polyline>
  <line
    x1="12"
    y1="15"
    x2="12"
    y2="3"
    stroke="var(--color-content-icon-primary)"
  ></line>
</svg>
