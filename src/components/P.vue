<template>
  <div
    :class="b({ variant, font, pointer, size, copy })"
    @click="onCopyContent"
  >
    <slot />
  </div>
</template>

<script>
import copy from 'clipboard-copy'

import { EVENTS } from '@/config'

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
      required: false
    },
    pointer: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      required: false
    },
    copy: {
      type: Boolean,
      required: false
    },
    content: {
      type: [String, Number],
      required: false
    }
  },
  methods: {
    onCopyContent() {
      if (this.copy && this.content) {
        copy(this.content)
        this.$emit(EVENTS.copy)
      }
    }
  }
}
</script>

<style lang="scss">
.P {
  color: var(--theme-color-font);

  letter-spacing: -0.139803px;

  &_font-medium {
    font-family: var(--font-family-medium);
  }

  &_font-regular {
    font-family: var(--font-family-regular);
  }

  &_font-bold {
    font-family: var(--font-family-bold);
  }

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

  &_variant-gray {
    color: var(--accent-color-gray);
  }

  &_copy {
    cursor: pointer;

    &:hover {
      cursor: pointer;
      // box-shadow: var(--default-box-shadow);
      // border-radius: var(--default-border-radius);
      // background-color: var(--theme-color-alert-border);
    }
  }
}
</style>
