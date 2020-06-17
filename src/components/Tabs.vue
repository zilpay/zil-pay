<template>
  <div :class="b()">
    <Button
      v-for="(el, index) of tabs"
      :key="index"
      :class="b('tab')"
      :color="el.variant"
      block
      @click="onChange(index)"
    >
      {{ el.name }}
    </Button>
  </div>
</template>

<script>
import { COLOR_VARIANTS } from '@/config'

import Button from '@/components/Button'

/**
 * Few buttons for navigate.
 * @example
 * import Tabs from '@/components/Tabs'
 * const tabs = 0
 * const elements = [
 *   {
 *     name: 'example',
 *     event: 'exampleEvent'
 *   },
 *   {
 *     name: 'example 1',
 *     event: 'exampleEvent 2'
 *   }
 * ]
 * <Tabs
 *   v-model="tabs"
 *   :elements="elements"
 * />
 */
export default {
  name: 'Tabs',
  components: {
    Button
  },
  props: {
    elements: {
      type: Array,
      required: true
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data() {
    return { }
  },
  computed: {
    tabs() {
      return this.elements.map((el, index) => ({
        ...el,
        variant: COLOR_VARIANTS.transparent
      }))
    }
  },
  methods: {
    onChange(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss">
.Tabs {
  display: flex;
  justify-content: center;

  width: 100%;

  button {
    font-size: 14px;
    max-width: 90px;
  }

  :first-of-type {
    border-radius: var(--default-border-radius) 0 0 var(--default-border-radius);
  }
  :last-of-type {
    border-radius: 0 var(--default-border-radius) var(--default-border-radius) 0;
  }
}
</style>
