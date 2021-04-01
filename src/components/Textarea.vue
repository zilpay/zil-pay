<template>
  <div :class="b()">
    <P
      :class="b('title')"
      left
    >
      {{ title }}
    </P>
    <textarea
      v-bind="$attrs"
      :class="b('element', { round, error: Boolean(error) })"
      :value="value"
      @input="onInput"
    >
      <slot />
    </textarea>
    <div :class="b('error')">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { EVENTS } from '@/config'
import P from '@/components/P'

export default {
  name: 'Textarea',
  components: {
    P
  },
  props: {
    value: {
      type: [String, Number],
      required: false
    },
    error: {
      type: [String, Number],
      required: false
    },
    title: {
      type: [String, Number],
      required: false
    },
    round: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onInput(event) {
      const { value } = event.target

      this.$emit(EVENTS.input, value)
    }
  }
}
</script>

<style lang="scss">
.Textarea {
  width: 100%;

  &__element {
    background: var(--opacity-bg-element);
    box-sizing: border-box;
    color: var(--theme-color-font);
    font-size: var(--size-sm-font);
    min-height: 100px;
    outline: none;
    overflow: hidden;
    padding: 15px;
    resize: none;
    width: 100%;

    &_round {
      border-radius: var(--default-border-radius);
    }

    &_error {
      border: 1px solid var(--accent-color-danger);
    }
  }

  &__error,
  &__title {
    margin-left: calc(var(--default-border-radius) - 5px);
  }

  &__title {
    margin-bottom: 5px;
    font-family: var(--font-family-bold);
  }

  &__error {
    margin-top: 5px;
    text-align: left;

    font-family: var(--font-family-regular);
    color: var(--accent-color-danger);
    font-size: var(--size-sm-font);
  }
}
</style>
