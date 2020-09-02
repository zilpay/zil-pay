<template>
  <div :class="b()">
    <P
      :class="b('title')"
      :font="FONT_VARIANTS.light"
      :variant="COLOR_VARIANTS.primary"
    >
      <slot />
    </P>
    <Radio
      v-for="(label, index) of elements"
      :key="index"
      :class="b('item')"
      :name="NAME"
      :value="value === label"
      @input="onInput(label)"
    >
      <P
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.light"
      >
        {{ label }}
      </P>
    </Radio>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid'
import { SIZE_VARIANS, FONT_VARIANTS, EVENTS, COLOR_VARIANTS } from '@/config'

import P from '@/components/P'
import Radio from '@/components/Radio'

const NAME = uuid()

/**
 * @example
 * import RadioGroup from '@/components/RadioGroup'
 * const elements = ['test1', 'test2']
 * <RadioGroup
 *   v-model="radioGroup.index"
 *   :elements="radioGroup.elements"
 * >
 *   Some Example title.
 * </RadioGroup>
 */
export default {
  name: 'RadioGroup',
  components: {
    P,
    Radio
  },
  props: {
    elements: {
      type: Array,
      required: true
    },
    value: {
      type: [Number, String],
      required: false
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      COLOR_VARIANTS,
      NAME
    }
  },
  methods: {
    onInput(item) {
      this.$emit(EVENTS.input, item)
    }
  }
}
</script>

<style lang="scss">
.RadioGroup {
  display: block;
  width: 100%;
  max-width: 360px;

  &__title {
    font-size: 20px;

    &:first-letter {
      text-transform: capitalize;
    }
  }

  &__item {
    padding: 15px 0 15px 0;
  }
}
</style>
