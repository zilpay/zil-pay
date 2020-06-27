<template>
  <div
    :class="b({ modal })"
    @click="onClick"
  >
    <SvgInject :variant="ICON_VARIANTS.add" />
    <a
      v-show="show"
      :class="b('close')"
    />
    <ul
      v-show="show"
      :class="b('circle')"
    >
      <li :class="b('sector')">
        <SvgInject :variant="ICON_VARIANTS.setup" />
      </li>
      <li :class="b('sector')">
        <SvgInject :variant="ICON_VARIANTS.security" />
      </li>
      <li :class="b('sector')">
        <SvgInject :variant="ICON_VARIANTS.trash" />
      </li>
    </ul>
  </div>
</template>

<script>
import SvgInject from '@/components/SvgInject'

import { ICON_VARIANTS, EVENTS } from '@/config'

export default {
  name: 'AddMenu',
  components: {
    SvgInject
  },
  props: {
    modal: {
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
    onClick() {
      if (this.modal) {
        this.show = !this.show
      }

      this.$emit(EVENTS.click)
    }
  }
}
</script>

<style lang="scss">
.AddMenu {
  cursor: pointer;

  position: absolute;
  bottom: 60px;
  right: 30px;

  svg {
    width: 36px;
    height: 36px;
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

  &__circle {
    position: fixed;
    bottom: -100px;
    right: -100px;

    height: 300px;
    width: 300px;

    z-index: 2;
    padding: 0;
    list-style: none;

    border-radius: 100%;
    background-color: var(--accent-color-info);
  }

  &__sector {
    position: absolute;

    bottom: 100px;
  }
}
</style>
