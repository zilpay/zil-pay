<template>
  <div :class="b()">
    <div :class="b('radio')">
      <input
        v-bind="$attrs"
        :id="uuid"
        type="radio"
      >
      <label
        :for="uuid"
        :class="b('radio-label')"
      >
        <slot />
      </label>
    </div>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

export default {
  name: 'Radio',
  data() {
    return {
      uuid: uuid()
    }
  }
}
</script>

<style lang="scss">
$color1: #f4f4f4;
$color2: #3197EE;

.Radio {
  &__radio-label {
    &:before {
      content: '';
      cursor: pointer;
      background: $color1;
      border-radius: 100%;
      border: 1px solid darken($color1, 25%);
      display: inline-block;
      width: 1.4em;
      height: 1.4em;
      position: relative;
      top: -0.2em;
      margin-right: 1em;
      vertical-align: top;
      text-align: center;
      transition: all 250ms ease;
    }
  }
}
input[type="radio"] {
  position: absolute;
  opacity: 0;

  &:checked {
    .Radio {
      &__radio-label {
        &:before {
          background-color: $color2;
          box-shadow: inset 0 0 0 4px $color1;
        }
      }
    }
  }

  &:focus {
  .Radio {
      &__radio-label {
        &:before {
          outline: none;
          border-color: $color2;
        }
      }
    }
  }
}
</style>
