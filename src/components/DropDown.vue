<template>
  <div :class="b()">
    <a
      v-show="value || show"
      :class="b('close')"
      @click="onDrop"
    />
    <div>
      <a @click="onDrop">
        <SvgInject
          :class="b('arrow')"
          :variant="ICON_VARIANTS.arrow"
        />
      </a>
      <div
        v-show="value || show"
        :class="b('menu')"
      >
        <a @click="onDrop">
          <SvgInject
            :class="b('arrow-inverted')"
            :variant="ICON_VARIANTS.arrow"
          />
        </a>
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { ICON_VARIANTS, EVENTS } from '@/config'

import SvgInject from '@/components/SvgInject'

export default {
  name: 'DropDown',
  components: {
    SvgInject
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ICON_VARIANTS,

      show: false
    }
  },
  methods: {
    onDrop() {
      this.show = !this.show
      this.$emit(EVENTS.input, !this.value)
    }
  }
}
</script>

<style lang="scss">
.DropDown {
  &__arrow,
  &__arrow-inverted {
    path {
      stroke: var(--accent-color-primary);
    }
  }

  &__arrow {
    transform: rotate(270deg);
  }

  &__arrow-inverted {
    transform: rotate(90deg);
  }

  &__menu {
    position: absolute;
    transform: translate(-70%, -24%);
    text-align: right;

    border-radius: 7px;
    background-color: var(--accent-color-second);
    padding: 10px;

    z-index: 3;
  }

  &__close {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 1;

    background-color: var(--opacity-bg-element-2);
    animation: fadeFull 0.2s;
  }
}
</style>
