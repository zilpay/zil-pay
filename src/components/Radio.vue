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
  display: flex;

  &__radio {
    position: absolute;
    visibility: hidden;
  }

  &__check {
    width: 20px;
    height: 20px;
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
      margin: 5px;
      width: 10px;
      height: 10px;
      background-color: var(--accent-color-info);
      border-radius: 100%;
    }
  }

  &__radio-label {
    cursor: pointer;
    display: flex;

    :last-of-type {
      margin-left: 10px;
    }
  }
}
</style>
