<template>
  <div :class="b()">
    <a
      :class="b('menu', { show })"
      @click="onDrop"
    >
      <P
        :font="FONT_VARIANTS.bold"
        :size="SIZE_VARIANS.sm"
      >
        {{ value.name }}
      </P>
      <div :class="b('arrow', { show })">
        <SvgInject :variant="ICON_VARIANTS.arrow" />
      </div>
    </a>
    <ul
      v-show="show"
      :class="b('scroll')"
    >
      <li
        v-for="(el, index) of items"
        :key="index"
        @click="onSelected(el)"
      >
        <P
          :font="FONT_VARIANTS.bold"
          :size="SIZE_VARIANS.sm"
        >
          {{ el.name }}
        </P>
        <P
          :font="FONT_VARIANTS.bold"
          :size="SIZE_VARIANS.sm"
        >
          {{ el.time }} ms
        </P>
      </li>
    </ul>
  </div>
</template>

<script>
import { ICON_VARIANTS, EVENTS, SIZE_VARIANS, FONT_VARIANTS } from '@/config'
import SvgInject from '@/components/SvgInject'
import P from '@/components/P'

export default {
  name: 'DropMenu',
  components: {
    SvgInject,
    P
  },
  props: {
    value: {
      type: Object
    },
    items: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      ICON_VARIANTS,
      FONT_VARIANTS,
      SIZE_VARIANS,

      show: false
    }
  },
  methods: {
    onDrop() {
      this.show = !this.show
    },
    onSelected(el) {
      this.$emit(EVENTS.input, el)
      this.show = !this.show
    }
  }
}
</script>

<style lang="scss">
.DropMenu {
  &__menu {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 16px;
    border: 1px solid var(--accent-color-primary);
    border-radius: 10px;

    &_show {
      border-top: 1px solid var(--accent-color-primary);
      border-left: 1px solid var(--accent-color-primary);
      border-right: 1px solid var(--accent-color-primary);
      border-bottom: none;

      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  &__arrow {
    transform: rotate(270deg);

    svg > path {
      stroke: var(--accent-color-primary);
    }

    &_show {
      transform: rotate(90deg);
    }
  }

  &__scroll {
    display: flex;
    flex-direction: column;

    border-bottom: 1px solid var(--accent-color-primary);
    border-left: 1px solid var(--accent-color-primary);
    border-right: 1px solid var(--accent-color-primary);

    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;

    padding: 0;
    margin: 0;
    list-style: none;

    overflow-y: scroll;
    height: 160px;

    & > li {
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 16px;

      border: 1px solid var(--app-background-color);

      &:hover {
        border: 1px solid var(--accent-color-primary);
        border-left: none;
        border-right: none;
      }
    }
  }
}
</style>
