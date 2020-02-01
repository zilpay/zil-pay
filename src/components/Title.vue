<template>
  <div
    :class="b({ variant, font, size })"
    @click="onClick"
  >
    <input
      v-if="changeable"
      :value="value"
      :class="b('input', { variant, font, size })"
      type="text"
      @change="onInput"
    >
    <slot v-if="!changeable"/>
  </div>
</template>

<script>
import { FONT_VARIANTS, SIZE_VARIANS, EVENTS } from '@/config'

/**
 * Text title component.
 * @param variant Color variant from config.
 * @param font Font variant from config.
 * @param size Size variant from config.
 * @param changeable Can use as v-model.
 * @event click Mouse click event.
 * @event input When changer info.
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
    },
    changeable: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      required: false
    }
  },
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    },
    onInput(event) {
      this.$emit(EVENTS.input, event.target.value)
    }
  }
}
</script>

<style lang="scss">
.Title {
  color: var(--theme-color-font);

  &__input {
    max-width: fit-content;
    max-width: 250px;
    max-height: 20px;

    color: var(--theme-color-font);
    text-indent: -1px;

    background-color: transparent;
    border: 0;
    outline: none;
    margin: 0;
    padding: 0;
  }

  &_font-medium,
  &__input_font-medium {
    font-family: var(--font-family-medium);
  }

  &_font-bold,
  &__input_font-bold {
    font-family: var(--font-family-bold);
  }

  &_font-light,
  &__input_font-light {
    font-family: var(--font-family-light);
  }

  &_size-xs,
  &__input_size-xs {
    font-size: var(--size-xs-font);
  }

  &_size-sm,
  &__input_size-sm {
    font-size: var(--size-sm-font);
  }

  &_size-md,
  &__input_size-md {
    font-size: var(--size-md-font);
  }

  &_size-lg,
  &__input_size-lg {
    font-size: var(--size-lg-font);
  }

  &_variant-success,
  &__input_variant-success {
    color: var(--accent-color-success);
  }

  &_variant-info,
  &__input_variant-info {
    color: var(--accent-color-info);
  }

  &_variant-danger,
  &__input_variant-danger {
    color: var(--accent-color-danger);
  }

  &_variant-warning,
  &__input_variant-warning {
    color: var(--accent-color-warning);
  }
}
</style>
