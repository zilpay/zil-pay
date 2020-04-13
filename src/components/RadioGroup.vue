<template>
  <div :class="b()">
    <P
      :class="b('title')"
      :font="FONT_VARIANTS.regular"
    >
      <slot />
    </P>
    <Radio
      v-for="(label, index) of elements"
      :key="index"
      :class="b('item', { border: index < elements.length - 1 })"
      :name="NAME"
      :value="value === label"
      @input="onInput(label)"
    >
      <P
        :size="SIZE_VARIANS.sm"
        :font="FONT_VARIANTS.medium"
      >
        {{ label }}
      </P>
    </Radio>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { SIZE_VARIANS, FONT_VARIANTS, EVENTS } from '@/config'

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
      required: true
    }
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
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

  border-right: 1px solid var(--accent-color-success);

  &__title {
    font-size: 15px;

    &:first-letter {
      text-transform: capitalize;
    }
  }

  &__item {
    padding: 15px 0 15px 0;

    &_border {
      border-bottom: 1px solid var(--accent-color-success);
    }
  }
}
</style>
