<template>
  <div :class="b()">
    <BottomBar :elements="test"/>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import {
  ICON_TYPE,
  ICON_VARIANTS,
  COLOR_VARIANTS,
  SIZE_VARIANS
} from '@/config'

import BottomBar from '@/components/BottomBar'

const test = [
  {
    value: 'Send',
    event: 'send',
    icon: ICON_VARIANTS.add,
    iconType: ICON_TYPE.svg,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  },
  {
    value: 'Receive',
    event: 'receive',
    icon: ICON_VARIANTS.add,
    iconType: ICON_TYPE.svg,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]

export default {
  name: 'Home',
  components: {
    BottomBar
  },
  data() {
    return {
      test
    }
  }
}
</script>

<style lang="scss">

</style>
