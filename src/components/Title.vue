<template>
  <div :class="b({ variant, font })">
    <slot />
  </div>
</template>

<script>
import { FONT_VARIANTS } from '@/config'

/**
 * @example
 * import { COLOR_VARIANTS } from '@/config'
 * import Title from '@/components/Title'
 * <Title>My content</Title>
 */
export default {
  name: 'Title',
  props: {
    variant: {
      type: String,
      required: false
    },
    font: {
      type: String,
      default: FONT_VARIANTS.bold
    }
  }
}
</script>

<style lang="scss">
.Title {
  font-size: 36px;
  line-height: 32px;

  color: var(--theme-color-font);

  &_font-medium {
    font-family: var(--font-family-medium);
  }

  &_font-bold {
    font-family: var(--font-family-bold);
  }
}
</style>
