<template>
  <div :class="b()">
    <input
      v-bind="$attrs"
      :value="value"
      :id="uuid"
      :class="b('radio')"
      type="radio"
      @input="onInput"
    >
    <label
      :for="uuid"
      :class="b('radio-label')"
    >
      <div :class="b('check', { checked: value })" />
      <div>
        <slot />
      </div>
    </label>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid'

import { EVENTS } from '@/config'

/**
 * Radio button.
 * @example
 * import Radio from '@/components/Radio'
 * const value = true
 * <Radio
 *   v-model="value"
 *   name="example"
 * >
 *   Some testing content
 * </Radio>
 */
export default {
  name: 'Radio',
  props: {
    value: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      uuid: uuid()
    }
  },
  methods: {
    onInput() {
      this.$emit(EVENTS.input, !this.value)
    }
  }
}
</script>

<style lang="scss">
.Radio {
  display: flex;

  &__radio {
    position: absolute;
    visibility: hidden;
  }

  &__check {
    width: 15px;
    height: 15px;
    background: transparent;
    border-radius: 100%;
    border: 3px solid var(--accent-color-primary);

    &_checked {
      border: 3px solid var(--accent-color-primary);

      &:before {
        content: " ";
      }
    }

    &:before {
      position: absolute;
      margin: 2px;
      width: 11px;
      height: 11px;
      background-color: var(--accent-color-primary);
      border-radius: 100%;
    }
  }

  &__radio-label {
    cursor: pointer;
    display: flex;
    align-items: center;

    :last-of-type {
      margin-left: 10px;
    }

    &:hover {
      .Radio__check {
        transition: all 0.5s ease-out;
        border: 3px solid var(--accent-color-primary);
      }
    }
  }
}
</style>
