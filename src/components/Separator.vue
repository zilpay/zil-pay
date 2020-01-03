<template>
  <div :class="b()" />
</template>

<script>
/**
 * Just Separator for split content.
 * @example
 * import Separator from '@/components/Separator'
 * <Separator />
 */
export default {
  name: 'Separator'
}
</script>

<style lang="scss">
$width:  320px !default;
$height: 1px   !default;
$radius: 50%   !default;

.Separator {
  width: $width;
  min-height: $height;

  border-radius: $radius;
  border: $height solid var(--theme-color-separator);

  background-color: var(--theme-color-separator);
}
</style>
