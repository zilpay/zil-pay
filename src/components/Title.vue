<template>
  <div :class="b({ variant })">
    <slot />
  </div>
</template>

<script>
import { COLOR_VARIANTS } from '@/config'

/**
 * @example
 * <Title>My content</Title>
 */
export default {
  name: 'Title',
  props: {
    variant: {
      type: String,
      default: COLOR_VARIANTS.black
    }
  }
}
</script>

<style lang="scss">
.Title {
  font-family: var(--font-family-bold);
  font-size: 48px;
  line-height: 58px;

  &_variant-black {
    color: var(--accent-color-black);
  }
}
</style>
