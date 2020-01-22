<template>
  <div :class="b()">
    <input
      v-bind="$attrs"
      :id="uuid"
      :class="b('radio')"
      :value="value"
      type="radio"
      @input="onInput"
    >
    <div :class="b('check', { checked: value })" />
    <label
      :for="uuid"
      :class="b('radio-label')"
    >
      <slot />
    </label>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

export default {
  name: 'Radio',
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      uuid: uuid()
    }
  },
  methods: {
    onInput() {
      this.$emit('input', !this.value)
    }
  }
}
</script>

<style lang="scss">
.Radio {
  cursor: pointer;
  display: flex;

  &__radio {
    position: absolute;
    visibility: hidden;
  }

  &__check {
    height: 20px;
    width: 20px;
    background: transparent;
    border-radius: 100%;
    border: 5px solid #AAAAAA;

    &_checked {
      &:before {
        content: " ";
      }
    }

    &:before {
      position: absolute;
      margin: 5px;
      width: 10px;
      height: 10px;
      background-color: black;
      border-radius: 100%;
    }
  }

  &__radio-label {
    cursor: pointer;
    padding-left: 10px;
  }
}
</style>
