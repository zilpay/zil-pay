<template>
  <div :class="b()">
    <div :class="b('info')">
      <Title :size="SIZE_VARIANS.md">
        {{ info.name }}
      </Title>
      <P>
        {{ info.address }}
      </P>
    </div>
    <div :class="b('balance')">
      <Title :size="SIZE_VARIANS.md">
        {{ balance.title }}
      </Title>
      <P>
        {{ balance.amount }}
      </P>
      <P
        :class="b('amount-currency')"
        :size="FONT_VARIANTS.medium"
      >
        {{ balance.usd }}
      </P>
    </div>
  </div>
</template>

<script>
import {
  SIZE_VARIANS,
  FONT_VARIANTS
} from '@/config'


import Title from '@/components/Title'
import P from '@/components/P'

export default {
  name: 'Account',
  components: {
    Title,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      info: {
        name: 'Ledger 0',
        address: 'zil1wl...zace'
      },
      balance: {
        title: 'Balance',
        amount: 'ZIL3.56471031',
        usd: '$512.78'
      }
    }
  }
}
</script>

<style lang="scss">
.Account {
  display: grid;
  grid-template-rows: 100px 100px;
  justify-content: left;
  align-items: center;
  min-width: calc(100vw - 30px);

  &__amount-currency {
    font-size: 12px;
    line-height: 19px;
  }
}
</style>
