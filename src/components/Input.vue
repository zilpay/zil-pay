<template>
  <input
    :class="b({ round, block, size })"
    :disabled="disabled"
    :placeholder="placeholder"
    :value="value"
    :type="type"
    :min="min"
    :max="max"
    :step="step"
    :required="required"
    :autofocus="autofocus"
    @input="onInput"
  />
</template>

<script>
import { SIZE_VARIANS } from '@/config'

export const INPUT_TYPES = {
  date: 'date',
  number: 'number',
  password: 'password',
  text: 'text',
  time: 'time'
}

export default {
  name: 'Input',
  props: {
    size: {
      type: String,
      default: SIZE_VARIANS.xs
    },
    round: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: [String, Number],
      required: false
    },
    value: {
      type: [String, Number],
      required: false
    },
    type: {
      type: String,
      default: INPUT_TYPES.text
    },
    min: {
      type: Number,
      required: false
    },
    max: {
      type: Number,
      required: false
    },
    step: {
      type: Number,
      required: false
    },
    required: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onInput(event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<style lang="scss">
.Input {
  font-family: var(--font-family-medium);
  font-size: 21px;
  line-height: 31px;

  border: 1px solid var(--accent-color-gray);
  background: transparent;
}

.Input {
  &_round {
    border-radius: .25rem;
  }

  &_block {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.Input {
  &_size-xs {
    height: var(--size-xs);
  }

  &_size-sm {
    height: var(--size-sm);
  }

  &_size-md {
    height: var(--size-md);
  }

  &_size-lg {
    height: var(--size-lg);
  }
}

.Input {
  &[disabled="disabled"] {
    cursor: unset;
    opacity: 0.5;
  }
}
</style>
