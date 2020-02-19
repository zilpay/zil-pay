<template>
  <textarea
    v-bind="$attrs"
    :class="b({ round })"
    :value="value"
    @input="onInput"
  >
    <slot />
  </textarea>
</template>

<script>
import { EVENTS } from '@/config'

export default {
  name: 'Textarea',
  props: {
    value: {
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
}
</style>
