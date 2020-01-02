<template>
  <label :class="b({ block, size })">
    <div :class="b('title')">
      {{ title }}
    </div>
    <input
      :class="b('element', { round, error: Boolean(error) })"
      :disabled="disabled"
      :placeholder="placeholder"
      :value="value"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      :required="required"
      :autofocus="autofocus"
      ref="input"
      @input="onInput"
    />
    <div :class="b('error')">
      {{ error }}
    </div>
  </label>
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
    title: {
      type: [String, Number],
      required: false
    },
    error: {
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
  },
  mounted() {
    if (this.autofocus) {
      this.$refs.input.focus()
    }
  }
}
</script>

<style lang="scss">
.Input {
  display: grid;

  justify-items: left;

  font-family: Poppins;
  font-style: normal;
  font-weight: 500;
  line-height: 15px;
}

.Input {
  &__title,
  &__error {
    width: 100%;

    padding-left: 15px;

    text-align: left;
  }

  &__element {
    width: 100%;

    border: 0;
    border-radius: 5px;

    text-indent: 15px;

    background: rgba(206, 206, 206, 0.4);

    &_error {
      border: 1px solid var(--accent-color-danger);
    }

    &:focus {
      outline: none;
    }
  }

  &__error {
    color: var(--accent-color-danger);
  }
}

.Input {
  &_block {
    display: block;
    width: 100%;
  }

  &_size-xs {
    .Input__element {
      height: var(--size-xs);
    }

    .Input__title,
    .Input__error {
      font-size: var(--size-xs-font);
    }
  }

  &_size-sm {
    .Input__element {
      height: var(--size-sm);
    }

    .Input__title,
    .Input__error {
      font-size: var(--size-sm-font);
    }
  }

  &_size-md {
    .Input__element {
      height: var(--size-md);
    }

    .Input__title,
    .Input__error {
      font-size: var(--size-md-font);
    }
  }

  &_size-lg {
    .Input__element {
      height: var(--size-lg);
    }

    .Input__title,
    .Input__error {
      font-size: var(--size-lg-font);
    }
  }
}
</style>
