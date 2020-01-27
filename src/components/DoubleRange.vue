<template>
  <div :class="b()">
    <input
      v-for="(val, index) of value"
      v-bind="$attrs"
      :key="index"
      :value="val"
      :class="b(RANGE)"
      :type="RANGE"
      @input="onInput($event.target.value, index)"
    />
  </div>
</template>

<script>
import { EVENTS } from '@/config'

const RANGE = 'range'

/**
 * Two range for changeing more range params.
 * @param value Vue model schema.
 * @event input Vue model schema.
 * @example
 * import DoubleRange from '@/components/DoubleRange'
 * const range = [0, 100]
 * <DoubleRange
 *   v-model="range"
 *   min="1"
 *   max="100"
 * />
 */
export default {
  name: 'DoubleRange',
  props: {
    value: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      RANGE
    }
  },
  methods: {
    onInput(value, index) {
      const currentState = this.value

      if (isNaN(value) || isNaN(index)) {
        return null
      }

      currentState[index] = Number(value)

      this.$emit(EVENTS.input, currentState)
    }
  }
}
</script>

<style lang="scss">
.DoubleRange {
  display: flex;
	flex-direction: column;
  position: relative;

  &__range {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    -webkit-appearance: none;
    background: var(--accent-color-info);
    height: 2px;
    outline: none;
    outline-offset: 0;
    pointer-events: none;

    &::-moz-focus-inner {
      border-style: none;
    }

    &::-moz-focus-outer {
      border-style: none;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: var(--accent-color-info);
      width: 10px;
      height: 10px;
      border-radius: 100%;
      border: none;
      cursor: pointer;
      pointer-events: all;
      z-index: 11;
    }

    &::-moz-range-thumb {
      background: var(--accent-color-info);
      width: 10px;
      height: 10px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      appearance: none;
      pointer-events: all;
    }

    &::-moz-range-track {
      outline: none;
      pointer-events: none;
    }
  }
}
</style>
