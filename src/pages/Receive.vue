<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('alert-info')">
      <Title :size="SIZE_VARIANS.sm">
        {{ ALERT_HEADER.title }}
      </Title>
      <P
        :class="b('deposit-info')"
        :font="FONT_VARIANTS.regular"
      >
        {{ ALERT_HEADER.description }}
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
          @click="onEvent(variant.uuid)"
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
          {{ getCurrentAccount.name }}
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
        >
          Export Private Key
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
import { mapState, mapGetters } from 'vuex'

import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_VARIANTS,
  ICON_TYPE
} from '@/config'

import { uuid } from 'uuidv4'

import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import Container from '@/components/Container'
import Separator from '@/components/Separator'
import BottomModal from '@/components/BottomModal'
import ViewblockLink from '@/components/ViewblockLink'

import { toAddress } from '@/filters'
import CopyMixin from '@/mixins/copy'
import LinksMixin from '@/mixins/links'

const ALERT_HEADER = {
  title: 'Deposit ZIL.',
  description: 'To interact with decentralized applications using ZilPay, you’ll need ZIL coin in your wallet.'
}
const TRANSFER = {
  icon: {
    name: ICON_VARIANTS.zilliqaLogo,
    width: '38',
    height: '51'
  },
  title: 'Transfer ZIL.',
  text: 'The easiest way to get ZIL is to simply transfer it from another address.',
  button: 'SHOW ADDRESS',
  uuid: uuid()
}
const BUY = {
  icon: false,
  title: 'Buy ZIL on CoinSwitch.',
  text: 'CoinSwitch is the one-stop destination to exchange more than 300 cryptocurrencies at the best rate.',
  button: 'BUY ZIL',
  uuid: uuid()
}
const FAUCET = {
  icon: {
    name: ICON_VARIANTS.drop,
    width: '38',
    height: '51'
  },
  title: 'Test Faucet.',
  text: 'Get ZIL from a faucet for the test network.',
  button: 'GET ZIL',
  uuid: uuid()
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
    Separator,
    BottomModal,
    ViewblockLink
  },
  filters: { toAddress },
  mixins: [CopyMixin, LinksMixin],
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      FONT_VARIANTS,
      ALERT_HEADER,

      accountInfo: false,
      qrcode: null
    }
  },
  computed: {
    ...mapState('settings', [
      'network',
      'networkConfig'
    ]),
    ...mapState('settings', ['addressFormat']),
    ...mapGetters('accounts', ['getCurrentAccount']),

    variants() {
      const [mainnet] = Object.keys(this.networkConfig)

      return [
        TRANSFER,
        mainnet === this.network ? BUY : FAUCET
      ]
    }
  },
  methods: {
    onEvent(uuid) {
      switch (uuid) {
      case FAUCET.uuid:
        this.linksToFaucet()
        break
      case BUY.uuid:
        this.linksToCoinswitch(toAddress(
          this.getCurrentAccount.address,
          this.addressFormat,
          false
        ))
        break
      case TRANSFER.uuid:
        this.accountInfo = true
        break
      default:
        break
      }
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
