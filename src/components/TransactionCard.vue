<template>
  <div
    :class="b()"
    @click="onClick"
  >
    <Icon
      :icon="statusIcon"
      height="15"
      width="15"
    />
    <div :class="b('wrapper')">
      <Container :class="b('first-line')">
        <P
          :class="b('send')"
          :font="FONT_VARIANTS.bold"
        >
          {{ txType }}
        </P>
        <P
          :class="b('zil')"
          :font="FONT_VARIANTS.light"
        >
          -ZIL{{ transaction.amount | fromZil }}
        </P>
      </Container>
      <Container :class="b('thirdly-line')">
        <P
          :class="b('time')"
          :variant="COLOR_VARIANTS.gray"
          :font="FONT_VARIANTS.regular"
        >
          {{ this.local.EPOCH }}: {{ transaction.block}}
        </P>
        <P
          :class="b('amount')"
          :variant="COLOR_VARIANTS.gray"
          :font="FONT_VARIANTS.regular"
        >
          -${{ transaction.amount | toConversion(getRate) }}
        </P>
      </Container>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'

import {
  ICON_VARIANTS,
  FONT_VARIANTS,
  COLOR_VARIANTS,
  SIZE_VARIANS,
  EVENTS
} from '@/config'

import P from '@/components/P'
import Container from '@/components/Container'
import Icon from '@/components/Icon'

import { fromZil, toConversion } from '@/filters'

export default {
  name: 'TransactionCard',
  components: {
    P,
    Icon,
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
      COLOR_VARIANTS,
      SIZE_VARIANS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
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
      } else if (this.transaction.error) {
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
  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;

  border-radius: 7px;
  background-color: var(--opacity-bg-element-1);
  padding: 8px;

  max-height: 40px;

  &__wrapper {
    width: 100%;
  }

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

  &__send,
  &__zil {
    font-size: 14px;
    line-height: 25px;
  }

  &__amount,
  &__time {
    font-size: 12px;
    line-height: 20px;
  }
}
</style>
