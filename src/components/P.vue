<template>
  <p :class="b({ variant, font, pointer, size })">
    <slot />
  </p>
</template>

<script>
import { FONT_VARIANTS, SIZE_VARIANS } from '@/config'

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
      default: SIZE_VARIANS.sm
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
