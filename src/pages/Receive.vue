<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('alert-info')">
      <Title :size="SIZE_VARIANS.sm">
        {{ alertHeader.title }}
      </Title>
      <P
        :class="b('deposit-info')"
        :font="FONT_VARIANTS.regular"
      >
        {{ alertHeader.description }}
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
      test
    </BottomModal>
  </div>
</template>

<script>
import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  ICON_VARIANTS
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

const alertHeader = {
  title: 'Deposit ZIL.',
  description: 'To interact with decentralized applications using ZilPay, you’ll need ZIL coin in your wallet.'
}
const variants = [
  {
    icon: {
      name: ICON_VARIANTS.zilliqaLogo,
      width: '38',
      height: '51'
    },
    title: 'Transfer ZIL.',
    text: 'The easiest way to get ZIL is to simply transfer it from another address.',
    button: 'SHOW ADDRESS',
    uuid: uuid()
  },
  {
    icon: false,
    title: 'Buy ZIL on CoinSwitch.',
    text: 'CoinSwitch is the one-stop destination to exchange more than 300 cryptocurrencies at the best rate.',
    button: 'BUY ZIL',
    uuid: uuid()
  }
]

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
    BottomModal
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      variants,
      alertHeader,
      accountInfo: false
    }
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
    white-space: normal;
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
}
</style>
