<template>
  <label :class="b()">
    <input
      v-bind="$attrs"
      :value="value"
      :class="b('input', { checked: value })"
      type="checkbox"
      @input="onInput"
    >
    <span :class="b('slider', { checked: value })" />
  </label>
</template>

<script>
import { v4 as uuid } from 'uuid'

import { EVENTS } from '@/config'

export default {
  name: 'SwitchBox',
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
.SwitchBox {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;

  &__input {
    opacity: 0;
    width: 0;
    height: 0;

    &_checked + .SwitchBox__slider:before {
      transform: translateX(23px);
      background-color: var(--accent-color-info);
    }
  }

  &__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--accent-color-gray);
    border-radius: 34px;
    transition: .4s;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      border-radius: 50%;
      background-color: var(--accent-color-white);
      transition: .4s;
    }
  }
}
</style>
