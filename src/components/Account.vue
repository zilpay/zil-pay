<template>
  <div :class="b()">
    <div :class="b('info')">
      <Title :size="SIZE_VARIANS.md">
        {{ getCurrentAccount.name }}
      </Title>
      <P>
        {{ getCurrentAccount.address | toAddress(ADDRESS_FORMAT_VARIANTS.bech32) }}
      </P>
    </div>
    <div :class="b('balance')">
      <Title :size="SIZE_VARIANS.md">
        {{ TITLE }}
      </Title>
      <P>
        {{ getCurrentAccount.balance | fromZil }}
      </P>
      <P
        :class="b('amount-currency')"
        :size="FONT_VARIANTS.medium"
      >
        {{ getCurrentAccount.balance | toConversion(0.001) }}
      </P>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ADDRESS_FORMAT_VARIANTS
} from '@/config'

import { toAddress, fromZil, toConversion } from '@/filters'

import Title from '@/components/Title'
import P from '@/components/P'

const TITLE = 'Balance'

export default {
  name: 'Account',
  components: {
    Title,
    P
  },
  filters: { toAddress, fromZil, toConversion },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      ADDRESS_FORMAT_VARIANTS,
      TITLE
    }
  },
  computed: {
    ...mapGetters('accounts', ['getCurrentAccount'])
  }
}
</script>

<style lang="scss">
.Account {
  display: grid;
  grid-template-rows: 100px 100px;
  justify-content: left;
  align-items: center;
  min-width: calc(360px - 30px);

  &__amount-currency {
    font-size: 12px;
    line-height: 19px;
  }
}
</style>
