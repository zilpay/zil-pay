<template>
  <div
    :class="b()"
    @click="onClick"
  >
    <Container :class="b('first-line')">
      <P
        :class="b('send')"
        :font="FONT_VARIANTS.bold"
      >
        {{ txType }}
      </P>
      <P
        :class="b('amount')"
        :font="FONT_VARIANTS.regular"
      >
        -ZIL{{ transaction.amount | fromZil }}
      </P>
    </Container>
    <Container :class="b('second-line')">
      <Icon
        :icon="statusIcon"
        height="15"
        width="15"
      />
      <Arrow
        :color="COLOR_VARIANTS.primary"
        height="10"
        width="2"
        right
      />
    </Container>
    <Container :class="b('thirdly-line')">
      <div :class="b('time')">
        {{ this.local.EPOCH }}: {{ transaction.block}}
      </div>
      <P
        :class="b('amount')"
        :font="FONT_VARIANTS.regular"
      >
        -${{ transaction.amount | toConversion('0.001') }}
      </P>
    </Container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  COLOR_VARIANTS,
  EVENTS
} from '@/config'

import P from '@/components/P'
import Container from '@/components/Container'
import Icon from '@/components/Icon'
import Arrow from '@/components/icons/Arrow'

import { fromZil, toConversion } from '@/filters'

export default {
  name: 'TransactionCard',
  components: {
    P,
    Icon,
    Arrow,
    Container
  },
  filters: { fromZil, toConversion },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      ICON_VARIANTS,
      FONT_VARIANTS,
      COLOR_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    txType() {
      const { Info } = this.transaction

      if (Info.includes('Contract Txn')) {
        return this.local.TRIGGER
      } else if (Info.includes('Contract Creation')) {
        return this.local.DEPLOY
      }

      return this.local.SEND
    },
    statusIcon() {
      if (!this.transaction.confirmed) {
        return ICON_VARIANTS.statusPadding
      } else if (this.transaction.confirmed && this.transaction.error) {
        return ICON_VARIANTS.statusDanger
      }

      return ICON_VARIANTS.statusSuccess
    }
  },
  methods: {
    onClick() {
      this.$emit(EVENTS.click)
    }
  },
  mounted() {
    [
      'Info',
      'TranID',
      'amount',
      'nonce',
      'toAddr'
    ].forEach(key => {
      if (!(key in this.transaction)) {
        throw new Error(`${key} is required.`)
      }
    })
  }
}
</script>

<style lang="scss">
.TransactionCard {
  cursor: pointer;
  height: 70px;

  &__first-line,
  &__second-line,
  &__thirdly-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-height: 20px;
  }

  &__thirdly-line,
  &__first-line {
    padding-left: 15px;
    padding-right: 15px;
  }

  &__send {
    font-size: 10px;
    line-height: 25px;
  }

  &__amount {
    font-size: 10px;
    line-height: 20px;
  }

  &__time {
    font-size: 10px;
    line-height: 20px;
    color: var(--theme-color-font);
  }
}
</style>
