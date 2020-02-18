<template>
  <div :class="b()">
    <div :class="b('info')">
      <Title
        :value="getCurrentAccount.name"
        :size="SIZE_VARIANS.md"
        changeable
        @input="setAccountName"
      />
      <P
        v-tooltip="copytitle"
        :content="getCurrentAccount.address | toAddress(addressFormat, false)"
        copy
        @copy="onCopyMixin"
      >
        {{ getCurrentAccount.address | toAddress(addressFormat) }}
      </P>
    </div>
    <div :class="b('balance')">
      <Title :size="SIZE_VARIANS.md">
        {{ local.BALANCE }}
      </Title>
      <P>
        {{ getCurrentAccount.balance | fromZil }}
      </P>
      <P
        :class="b('amount-currency')"
        :size="FONT_VARIANTS.medium"
      >
        {{ getCurrentAccount.balance | toConversion(getRate) }}
      </P>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ADDRESS_FORMAT_VARIANTS
} from '@/config'

import { toAddress, fromZil, toConversion } from '@/filters'
import CopyMixin from '@/mixins/copy'

import Title from '@/components/Title'
import P from '@/components/P'

export default {
  name: 'Account',
  components: {
    Title,
    P
  },
  mixins: [CopyMixin],
  filters: { toAddress, fromZil, toConversion },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      ADDRESS_FORMAT_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ]),
  },
  methods: {
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccountName
    ])
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
