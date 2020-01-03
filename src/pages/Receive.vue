<template>
  <div :class="b()">
    <TopBar />
    <Alert>
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
    <Container :class="b('wrapper')">
      <Container
        v-for="variant of variants"
        :key="variant.uuid"
        :class="b('receipt-options')"
      >
        <div :class="b('options-header')">
          <Icon
            v-if="Boolean(variant.icon)"
            :class="b('logo')"
            :icon="variant.icon.name"
            :width="variant.icon.width"
            :height="variant.icon.height"
          />
          <Title :size="SIZE_VARIANS.sm">
            {{ variant.title }}
          </Title>
        </div>
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
      </Container>
    </Container>
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
    Container
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      variants,
      alertHeader
    }
  }
}
</script>

<style lang="scss">
.Receive {
  &__wrapper {
    display: grid;
    grid-gap: 30px;

    padding-left: 15px;
    padding-right: 15px;
    padding-top: 30px;
  }

  &__receipt-options {
    display: grid;
    justify-content: left;
    grid-gap: 15px;
  }

  &__options-header {
    display: inline-grid;
    grid-template-columns: max-content 1fr;
    grid-gap: 15px;
  }

  &__deposit-info {
    font-size: 13px;
    line-height: 15px;

    letter-spacing: -0.139803px;

    max-width: 290px;
  }

  &__deposit-btn {
    width: 175px;
  }
}
</style>
