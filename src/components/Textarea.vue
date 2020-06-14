<template>
  <Container :class="b()">
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
  </Container>
</template>

<script>
import { EVENTS } from '@/config'
import Container from '@/components/Container'
import P from '@/components/P'

export default {
  name: 'Textarea',
  components: {
    Container,
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
  display: grid;
  grid-template-rows: min-content auto min-content;
  grid-template-columns: minmax(250px, 50vh);
  justify-content: center;

  &__element {
    min-height: 100px;

    padding: 15px;

    border: 0;

    font-size: var(--size-sm-font);
    color: var(--theme-color-font);

    background: var(--opacity-bg-element);
    border: 2px solid var(--accent-color-primary);
    border-radius: var(--default-border-radius);

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

  &__error,
  &__title {
    margin-left: calc(var(--default-border-radius) - 5px);
  }

  &__title {
    margin-bottom: 5px;
    font-family: var(--font-family-bold);
  }

  &__error {
    text-align: left;

    font-family: var(--font-family-regular);
    color: var(--accent-color-danger);
    font-size: var(--size-xs-font);
  }
}
</style>
