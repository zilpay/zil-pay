<template>
  <div
    :class="b({ variant, font, size })"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<script>
import { FONT_VARIANTS, SIZE_VARIANS, EVENTS } from '@/config'

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
    },
    size: {
      type: String,
      default: SIZE_VARIANS.lg
    }
  },
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    }
  }
}
</script>

<style lang="scss">
.Title {
  color: var(--theme-color-font);

  &_font-medium {
    font-family: var(--font-family-medium);
  }

  &_font-bold {
    font-family: var(--font-family-bold);
  }

  &_font-light {
    font-family: var(--font-family-light);
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

  &_variant-success {
    color: var(--accent-color-success);
  }

  &_variant-info {
    color: var(--accent-color-info);
  }

  &_variant-danger {
    color: var(--accent-color-danger);
  }

  &_variant-warning {
    color: var(--accent-color-warning);
  }
}
</style>
