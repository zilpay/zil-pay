<template>
  <div :class="b()">
    <TopBar/>
    <P
      :class="b('reset', 'pointer')"
      @click="onReset"
    >
      {{ local.RESET }}
    </P>
    <div
      v-if="getCurrentAccount"
      :class="b('wrapper')"
    >
      <Title
        :class="b('name')"
        :value="getAccountName(getCurrentAccount)"
        :variant="COLOR_VARIANTS.primary"
        :size="SIZE_VARIANS.md"
        changeable
        @input="setAccountName"
      >
        {{ getAccountName(getCurrentAccount) }}
      </Title>
      <P v-show="nonce">
        Nonce: #{{ nonce - 1 }}
      </P>
      <Icon
        v-if="qrcode"
        :icon="qrcode"
        :type="ICON_TYPE.auto"
        height="200"
        width="200"
      />
      <input
        :class="b('copy')"
        :value="getCurrentAccount.address | toAddress(addressFormat, false)"
        readonly
      >
      <ViewblockLink :address="getCurrentAccount.address" />
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

import { mapMutations, mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import modalStore from '@/store/modal'
import accountsStore from '@/store/accounts'
import transactionsStore from '@/store/transactions'

import {
  COLOR_VARIANTS,
  SIZE_VARIANS,
  ICON_VARIANTS,
  ICON_TYPE
} from '@/config'

import TopBar from '@/components/TopBar'
import Title from '@/components/Title'
import Icon from '@/components/Icon'
import P from '@/components/P'
import ViewblockLink from '@/components/ViewblockLink'

import AccountMixin from '@/mixins/account'
import CopyMixin from '@/mixins/copy'
import { toAddress } from '@/filters'
import { Background, clearTransactionsHistory } from '@/services'

export default {
  name: 'Account',
  components: {
    TopBar,
    Title,
    Icon,
    P,
    ViewblockLink
  },
  filters: { toAddress },
  mixins: [CopyMixin, AccountMixin],
  data() {
    return {
      COLOR_VARIANTS,
      SIZE_VARIANS,
      ICON_TYPE,
      ICON_VARIANTS,

      qrcode: null,
      nonce: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(modalStore.STORE_NAME, [
      modalStore.STATE_NAMES.accountModal
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ])
  },
  methods: {
    ...mapMutations(accountsStore.STORE_NAME, [
      accountsStore.MUTATIONS_NAMES.setAccountName
    ]),
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setClearTxHistory
    ]),
    async qrcodeGenerate() {
      if (!this.getCurrentAccount || !this.getCurrentAccount.address) {
        setTimeout(() => this.qrcodeGenerate(), 1000)
        return null
      }

      const address = toAddress(
        this.getCurrentAccount.address,
        this.addressFormat,
        false
      )
      this.qrcode = await QRCode.toDataURL(
        `zilliqa://${address}`
      )
    },
    async getUpdate() {
      const bg = new Background()
      this.nonce = await bg.getNonce()
    },
    async onReset() {
      this.setClearTxHistory()
      await clearTransactionsHistory()
      await this.getUpdate()
    }
  },
  mounted() {
    this.qrcodeGenerate()
    this.getUpdate()
  }
}
</script>

<style lang="scss">
.Account {
  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__reset {
    position: absolute;
    right: 20px;
    top: 20px;
    text-decoration: underline;
  }
}
</style>
