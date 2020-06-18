<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('alert-info')">
      <Title :size="SIZE_VARIANS.sm">
        {{ local.DEPOSIT }} ZIL
      </Title>
      <P
        :class="b('deposit-info')"
        :font="FONT_VARIANTS.regular"
      >
        {{ local.RECEIVE_DEPOSIT_DIS }}
      </P>
    </Alert>
    <Container
      v-for="(variant, index) of variants"
      :key="variant.uuid"
      :class="b('receipt-options')"
    >
      <div :class="b('header')">
        <Icon
          v-if="Boolean(variant.icon)"
          :icon="variant.icon.name"
          :width="variant.icon.width"
          :height="variant.icon.height"
        />
        <Title :size="SIZE_VARIANS.sm">
          {{ variant.title }}
        </Title>
      </div>
      <div :class="b('content')">
        <P
          :class="b('deposit-info')"
          :font="FONT_VARIANTS.regular"
        >
          {{ variant.text }}
        </P>
        <Button
          :class="b('deposit-btn')"
          :size="SIZE_VARIANS.xs"
          round
          @click="onEvent(variant.event)"
        >
          {{ variant.button }}
        </Button>
      </div>
      <Separator
        v-show="index < variants.length - 1"
        :class="b('separator')"
      />
    </Container>
    <BottomModal v-model="accountInfo">
      <Container :class="b('account')">
        <Title :size="SIZE_VARIANS.sm">
          {{ getAccountName(getCurrentAccount) }}
        </Title>
        <Icon
          v-if="qrcode"
          :src="qrcode"
          :type="ICON_TYPE.auto"
          height="200"
          width="200"
        />
        <P
          v-tooltip="copytitle"
          :content="getCurrentAccount.address | toAddress(addressFormat, false)"
          copy
          @copy="onCopyMixin"
        >
          {{ getCurrentAccount.address | toAddress(addressFormat) }}
        </P>
        <Button
          round
          block
          @click="onExport"
        >
          {{ local.EXPORT }}
        </Button>
        <ViewblockLink
          :class="b('view-block')"
          :address="getCurrentAccount.address"
        />
      </Container>
    </BottomModal>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import { uuid } from 'uuidv4'
import { mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'
import accountsStore from '@/store/accounts'
import uiStore from '@/store/ui'

import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_VARIANTS,
  ICON_TYPE
} from '@/config'

import ExportPage from '@/pages/accounts/Export'

import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import Container from '@/components/Container'
import BottomModal from '@/components/BottomModal'
import ViewblockLink from '@/components/ViewblockLink'

import { toAddress } from '@/filters'
import CopyMixin from '@/mixins/copy'
import AccountMixin from '@/mixins/account'
import LinksMixin from '@/mixins/links'

const DEFAUL_IMG_SIZE = {
  width: '38',
  height: '51'
}
const EVENTS = {
  faucet: uuid(),
  buy: uuid(),
  transfer: uuid()
}
export default {
  name: 'Receive',
  components: {
    TopBar,
    Alert,
    Title,
    P,
    Icon,
    Button,
    Container,
    BottomModal,
    ViewblockLink
  },
  filters: { toAddress },
  mixins: [CopyMixin, LinksMixin, AccountMixin],
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      FONT_VARIANTS,

      accountInfo: false,
      qrcode: null
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.networkConfig,
      settingsStore.STATE_NAMES.network,
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),

    variants() {
      const [mainnet] = Object.keys(this.networkConfig)
      const elements = [{
        icon: {
          ...DEFAUL_IMG_SIZE,
          name: ICON_VARIANTS.zilliqaLogo
        },
        title: `${this.local.TRANSFER} ZIL.`,
        text: this.local.TRANSFER_DIS,
        button: `${this.local.SHOW} ${this.local.ADDRESS}`,
        event: EVENTS.transfer
      }]

      if (mainnet === this.network) {
        elements.push({
          icon: false,
          title: `${this.local.BUY} ${this.local.BUY_ON}.`,
          text: this.local.BUY_DIS,
          button: `${this.local.BUY} ZIL`,
          event: EVENTS.buy
        })
      } else {
        elements.push({
          icon: {
            ...DEFAUL_IMG_SIZE,
            name: ICON_VARIANTS.drop
          },
          event: EVENTS.faucet,
          title: this.local.TEST_FAUCET,
          text: this.local.TEST_FAUCET_DIS,
          button: `${this.local.GET} ZIL`,
        })
      }

      return elements
    }
  },
  methods: {
    onEvent(uuid) {
      switch (uuid) {
      case EVENTS.faucet:
        this.linksToFaucet()
        break
      case EVENTS.buy:
        this.linksToCoinswitch(toAddress(
          this.getCurrentAccount.address,
          this.addressFormat,
          false
        ))
        break
      case EVENTS.transfer:
        this.accountInfo = true
        break
      default:
        break
      }
    },
    onExport() {
      this.$router.push({
        name: ExportPage.name
      })
    },
    async qrcodeGenerate() {
      const address = toAddress(
        this.getCurrentAccount.address,
        this.addressFormat,
        false
      )

      this.qrcode = await QRCode.toDataURL(
        `zilliqa:${address}`
      )
    }
  },
  mounted() {
    this.qrcodeGenerate()
  }
}
</script>

<style lang="scss">
.Receive {
  &__receipt-options {
    display: grid;
    justify-content: left;
    grid-gap: 15px;

    padding-top: 30px;
  }

  &__alert-info {
    height: 80px;
  }

  &__header,
  &__content {
    display: inline-grid;
    grid-gap: 15px;

    padding: 0 15px 0 15px;
  }

  &__header {
    display: inline-grid;
    grid-template-columns: max-content 1fr;
  }

  &__deposit-info {
    font-size: 13px;
    line-height: 15px;

    letter-spacing: -0.139803px;
  }

  &__deposit-btn {
    width: 175px;
  }

  &__separator {
    grid-area: "separator";
  }

  &__account {
    display: grid;
    justify-content: center;
    justify-items: center;
    grid-gap: 15px;

    padding-top: 15px;
    padding-bottom: 15px;
  }

  &__view-block {
    justify-self: right;
  }
}
</style>
