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
$width:  360px   !default;
$height: 0.03rem !default;
$radius: 50%     !default;

.Separator {
  max-width: $width;

  border-radius: $radius;
  border: $height solid var(--theme-color-separator);

  background-color: var(--theme-color-separator);
}
</style>
