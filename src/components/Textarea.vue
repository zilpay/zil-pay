<template>
  <Container :class="b()">
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
  </Container>
</template>

<script>
import { EVENTS } from '@/config'
import Container from '@/components/Container'

export default {
  name: 'Textarea',
  components: {
    Container
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
  &__element {
    display: inline-block;

    width: 100%;
    height: 100px;

    padding-left: 15px;
    padding-top: 15px;

    border: 0;

    font-size: var(--size-sm-font);
    color: var(--theme-color-font);
    background-color: var(--theme-color-input);

    outline: none;
    resize: none;
    overflow: hidden;

    &_round {
      border-radius: var(--default-border-radius);
    }

    &_error {
      border: 1px solid var(--accent-color-danger);
    }
  }

  &__error {
    text-align: left;

    font-family: var(--font-family-regular);
    color: var(--accent-color-danger);
    font-size: var(--size-xs-font);
  }
}
</style>
