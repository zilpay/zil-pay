<template>
  <div :class="b()">
    <Title :size="SIZE_VARIANS.md">
      {{ title }}
    </Title>
    <div
      v-for="(label, index) of elements"
      :key="index"
    >
      <Radio @input="$emit('selected', index)">
        <Title :size="SIZE_VARIANS.md">
          {{ label }}
        </Title>
      </Radio>
    </div>
  </div>
</template>

<script>
import { SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import Radio from '@/components/Radio'

/**
 * @example
 * import RadioGroup from '@/components/RadioGroup'
 * const title = 'some text'
 * const elements = ['test1', 'test2']
 * <RadioGroup
 *   :title="title"
 *   :elements="elements"
 * />
 */
export default {
  name: 'RadioGroup',
  components: {
    Title,
    Radio
  },
  props: {
    title: {
      type: String,
      required: false
    },
    elements: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      SIZE_VARIANS
    }
  }
}
</script>

<style lang="scss">
.RadioGroup {
}
</style>
