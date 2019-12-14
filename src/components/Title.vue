<template>
  <div :class="b({ variant, font })">
    <slot />
  </div>
</template>

<script>
import {
  COLOR_VARIANTS,
  FONT_VARIANTS
} from '@/config'

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
      default: COLOR_VARIANTS.black
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

  letter-spacing: -0.1875px;

  &_variant-black {
    color: var(--accent-color-black);
  }

  &_font-light {
    font-family: var(--font-family-light);
  }

  &_font-medium {
    font-family: var(--font-family-medium);
  }

  &_font-bold {
    font-family: var(--font-family-bold);
  }
}
</style>
