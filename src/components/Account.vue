<template>
  <div
    v-if="getCurrentAccount"
    :class="b()"
  >
    <Container>
      <Title
        :value="name"
        :size="SIZE_VARIANS.md"
        changeable
        @input="setAccountName"
      />
      <P
        v-tooltip="copytitle"
        :class="b('address')"
        :content="getCurrentAccount.address | toAddress(addressFormat, false)"
        copy
        nowrap
        @copy="onCopyMixin"
      >
        {{ getCurrentAccount.address | toAddress(addressFormat, false) }}
      </P>
    </Container>
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
import Container from '@/components/Container'
import P from '@/components/P'

export default {
  name: 'Account',
  components: {
    Title,
    P,
    Container
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

    name() {
      if (!this.getCurrentAccount) {
        return ''
      } else if (this.getCurrentAccount.name) {
        return this.getCurrentAccount.name
      } else if (this.getCurrentAccount.isImport) {
        return `${this.local.IMPORTED} ${this.getCurrentAccount.index}`
      } else if (this.getCurrentAccount.hwType) {
        return `${this.getCurrentAccount.hwType} ${this.getCurrentAccount.index}`
      }

      return `${this.local.ACCOUNT} ${this.getCurrentAccount.index}`
    }
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

  &__address {
    width: calc(360px - 50px);
  }

  &__amount-currency {
    font-size: 12px;
    line-height: 19px;
  }
}
</style>
