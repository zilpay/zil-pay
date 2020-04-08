<template>
  <div
    :class="b({
      variant,
      font,
      pointer,
      size,
      copy,
      nowrap,
      capitalize,
      centred
    })"
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
    },
    nowrap: {
      type: Boolean,
      required: false
    },
    centred: {
      type: Boolean,
      required: false
    },
    capitalize: {
      type: Boolean,
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

  transition: all 0.5s linear;

  &_nowrap {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &_font-medium {
    font-family: var(--font-family-medium);
  }

  &_font-regular {
    font-family: var(--font-family-regular);
  }

  &_font-bold {
    font-family: var(--font-family-bold);
  }

  &_font-light {
    font-family: var(--font-family-light);
  }

  &_pointer {
    cursor: pointer;
  }

  &_centred {
    text-align: center;
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

  &_variant-danger {
    color: var(--accent-color-danger);
  }

  &_copy {
    cursor: pointer;

    &:hover {
      cursor: pointer;
      text-shadow: 0 0 0.5em var(--accent-color-gray);
    }
  }

  &_capitalize {
    text-transform: capitalize;
  }
}
</style>
