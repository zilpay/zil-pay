<template>
  <div :class="b()">
    <Buttom
      v-for="el of elements"
      :class="b('btn')"
      :key="el.uuid"
      :size="el.size"
      :color="el.variant"
      block
      @click="onClick(el)"
    >
      <Icon
        v-if="el.icon"
        :class="b('icon')"
        :icon="el.icon"
        height="15"
        width="15"
      />
      {{ el.value }}
    </Buttom>
  </div>
</template>

<script>
import { EVENTS } from '@/config'

import Buttom from '@/components/Button'
import Icon from '@/components/Icon'

/**
 * Bottom action buttons.
 * @example
 * import { uuid } from 'uuidv4'
 * import {
 *   ICON_TYPE,
 *   ICON_VARIANTS,
 *   COLOR_VARIANTS,
 *   SIZE_VARIANS
 *  } from '@/config'
 * import BottomBar from '@/components/BottomBar'
 * const test = [
 *  {
 *     value: 'Send',
 *     event: 'send',
 *     icon: ICON_VARIANTS.add,
 *     iconType: ICON_TYPE.svg,
 *     variant: COLOR_VARIANTS.primary,
 *     size: SIZE_VARIANS.sm,
 *     uuid: uuid()
 *  },
 *  {
 *     value: 'Receive',
 *     event: 'receive',
 *     icon: ICON_VARIANTS.add,
 *     iconType: ICON_TYPE.svg,
 *     variant: COLOR_VARIANTS.primary,
 *     size: SIZE_VARIANS.sm,
 *     uuid: uuid()
 *   }
 * ]
 * <BottomBar
 *   :elements="test"
 *   @click="/ do somethink.../"
 * />
 */
export default {
  name: 'BottomBar',
  components: {
    Buttom,
    Icon
  },
  props: {
    elements: {
      type: Array,
      required: true
    }
  },
  mounted() {
    [
      'value',
      'event',
      'variant',
      'size',
      'uuid'
    ].forEach(necessaryKey => {
      this.elements.forEach(btnObject => {
        if (!(necessaryKey in btnObject)) {
          throw new Error(`${necessaryKey} is necessary for BottomBar.`)
        }
      })
    })
  },
  methods: {
    onClick(element) {
      this.$emit(EVENTS.click, element.event)
    }
  }
}
</script>

<style lang="scss">
.BottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;

  max-width: 360px;

  &__btn {
    display: flex;
    justify-content: center;
    align-items: center;

    font-family: var(--font-family-bold);
    font-size: var(--size-sm-font);
  }

  &__icon {
    padding-right: 5px;
  }
}
</style>
