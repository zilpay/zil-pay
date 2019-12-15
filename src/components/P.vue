<template>
  <p :class="b({ variant, font, pointer })">
    <slot />
  </p>
</template>

<script>
import { FONT_VARIANTS } from '@/config'

/**
 * @example
 * import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'
 * import P from '@/components/P'
 * <P :variant="COLOR_VARIANTS.black">My content</P>
 */
export default {
  name: 'P',
  props: {
    variant: {
      type: String,
      required: false
    },
    font: {
      type: String,
      default: FONT_VARIANTS.light
    },
    pointer: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss">
.P {
  font-style: normal;
  font-weight: normal;
  font-size: 22px;
  line-height: 32px;

  color: var(--theme-color-font);

  &_pointer {
    cursor: pointer;
  }
}
</style>
