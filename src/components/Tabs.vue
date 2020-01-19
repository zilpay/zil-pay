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
  computed: {
    tabs() {
      return this.elements.map((el, index) => ({
        ...el,
        variant: index === this.value ? COLOR_VARIANTS.primary : COLOR_VARIANTS.transparent
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

  width: 260px;

  :first-of-type {
    border-radius: var(--default-border-radius) 0 0 var(--default-border-radius);
  }
  :last-of-type {
    border-radius: 0 var(--default-border-radius) var(--default-border-radius) 0;
  }
}
</style>
