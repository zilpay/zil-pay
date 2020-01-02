<template>
  <div :class="b({ variant, font, pointer, size })">
    <slot />
  </div>
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
    },
    size: {
      type: String,
      required: false
    }
  }
}
</script>

<style lang="scss">
.P {
  color: var(--theme-color-font);

  letter-spacing: -0.139803px;

  &_pointer {
    cursor: pointer;
  }

  &_size-xs {
    font-size: var(--size-xs-font);
  }

  &_size-sm {
    font-size: var(--size-sm-font);
  }

  &_size-md {
    font-size: var(--size-md-font);
  }

  &_size-lg {
    font-size: var(--size-lg-font);
  }
}
</style>
