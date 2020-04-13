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
import { uuid } from 'uuidv4'

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
  transition: all 0.5s ease-out;

  &__radio {
    position: absolute;
    visibility: hidden;
  }

  &__check {
    width: 15px;
    height: 15px;
    background: transparent;
    border-radius: 100%;
    border: 3px solid var(--theme-color-separator);

    &_checked {
      border: 3px solid var(--accent-color-info);

      &:before {
        content: " ";
      }
    }

    &:before {
      position: absolute;
      margin: 2px;
      width: 11px;
      height: 11px;
      background-color: var(--accent-color-info);
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
        border: 3px solid var(--accent-color-info);
      }
    }
  }
}
</style>
