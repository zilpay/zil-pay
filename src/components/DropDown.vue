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
        <ul :class="b('items')">
          <li
            v-for="(el, index) of items"
            :key="index"
            :class="b('el')"
            @click="onSelected(el, index)"
          >
            <SvgInject
              v-if="el.icon"
              :variant="el.icon"
            />
            <P>
              {{ el.text }}
            </P>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ICON_VARIANTS, EVENTS } from '@/config'

import SvgInject from '@/components/SvgInject'
import P from '@/components/P'

export default {
  name: 'DropDown',
  components: {
    SvgInject,
    P
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      required: false
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
    },
    onSelected(el, index) {
      this.$emit(EVENTS.selected, {
        el,
        index
      })
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

  &__items {
    display: grid;
    grid-gap: 10px;

    list-style: none;
    padding: 0;
    font-size: 12px;
    line-height: 14px;
    font-weight: 600;
  }

  &__el {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > svg {
      max-width: 15px;
      max-height: 15px;
    }

    & > .P {
      min-width: 50px;
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

    border-radius: 7px;
    background-color: var(--accent-color-second);
    padding: 10px;
    text-align: right;

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
