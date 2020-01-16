<template>
  <div :class="b()">
    <div :class="b('first-line')">
      <P
        :class="b('send')"
        :font="FONT_VARIANTS.bold"
      >
        Send
      </P>
      <P
        :class="b('amount')"
        :font="FONT_VARIANTS.regular"
      >
        -ZIL10
      </P>
    </div>
    <div :class="b('second-line')">
      <Icon
        :icon="ICON_VARIANTS.statusDanger"
        height="15"
        width="15"
      />
      <Arrow
        :color="COLOR_VARIANTS.primary"
        height="15"
        width="2"
        right
      />
    </div>
    <div :class="b('thirdly-line')">
      <div :class="b('time')">
        1 min ago
      </div>
      <P
        :class="b('amount')"
        :font="FONT_VARIANTS.regular"
      >
        -$0.005
      </P>
    </div>
  </div>
</template>

<script>
import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  COLOR_VARIANTS
} from '@/config'

import P from '@/components/P'
import Icon from '@/components/Icon'
import Arrow from '@/components/icons/Arrow'

export default {
  name: 'TransactionCard',
  components: {
    P,
    Icon,
    Arrow
  },
  data() {
    return {
      ICON_VARIANTS,
      FONT_VARIANTS,
      COLOR_VARIANTS
    }
  }
}
</script>

<style lang="scss">
.TransactionCard {
  height: 70px;

  &__first-line,
  &__second-line,
  &__thirdly-line {
    display: flex;
    justify-content: space-between;
  }

  &__thirdly-line,
  &__first-line {
    padding-left: 15px;
    padding-right: 15px;
  }

  &__send {
    font-weight: 600;
    font-size: 10px;
    line-height: 25px;
  }

  &__amount {
    font-weight: normal;
    font-size: 10px;
    line-height: 20px;
  }

  &__time {
    font-size: 10px;
    line-height: 20px;
    color: var(--theme-color-separator);
  }
}
</style>
