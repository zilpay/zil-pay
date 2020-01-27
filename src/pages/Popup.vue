<template>
  <div :class="b()">
    <Alert
      :class="b('from')"
      pointer
      @click="onCallFrom"
    >
      <Title
        :size="SIZE_VARIANS.md"
        :font="FONT_VARIANTS.regular"
      >
        Address from
      </Title>
      <P>
        zil1az5e0c6e4s4pazgahhmlca2cvgamp6kjtaxf4q
      </P>
    </Alert>
    <Container :class="b('wrapper')">
      <Icon
        :src="TEST_URL"
        width="40"
        height="40"
      />
      <GasControl
        :value="defaultGas"
        :DEFAULT="DEFAULT_GAS_FEE"
        @input="setGasTx"
      />
      <div :class="b('amount')">
        <P :font="FONT_VARIANTS.bold">
          amount
        </P>
        <P :font="FONT_VARIANTS.bold">
          ZIL123
        </P>
    </div>
    </Container>
    <Separator />
    <Container :class="b('details')">
      <Title
        :size="SIZE_VARIANS.md"
        :font="FONT_VARIANTS.regular"
      >
        View details
      </Title>
      <Icon
        :icon="ICON_VARIANTS.arrowInCircle"
        width="40"
        height="40"
      />
    </Container>
    <Alert
      :class="b('to')"
      pointer
    >
      <Title
        :size="SIZE_VARIANS.md"
        :font="FONT_VARIANTS.regular"
      >
        Address to
      </Title>
      <P>
        zil1az5e0c6e4s4pazgahhmlca2cvgamp6kjtaxf4q
      </P>
    </Alert>
    <BottomBar
      :elements="BOTTOM_BAR"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { uuid } from 'uuidv4'
import {
  SIZE_VARIANS,
  FONT_VARIANTS,
  EVENTS,
  COLOR_VARIANTS,
  ICON_VARIANTS
} from '@/config'
import { DEFAULT_GAS_FEE } from '../../config/zilliqa'

import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import Container from '@/components/Container'
import GasControl from '@/components/GasControl'
import Separator from '@/components/Separator'
import BottomBar from '@/components/BottomBar'

import { fromZil, toConversion, toAddress } from '@/filters'

const BOTTOM_BAR = [
  {
    value: 'CONFIRM',
    event: EVENTS.cancel,
    size: SIZE_VARIANS.sm,
    variant: COLOR_VARIANTS.primary,
    uuid: uuid()
  },
  {
    value: 'REJECT',
    event: EVENTS.send,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]
// eslint-disable-next-line max-len
const TEST_URL = 'https://dappreview.oss-cn-hangzhou.aliyuncs.com/dappLogo/11729/rocketgame.vip/AXd8XwDdCibdyfF7bjJQDfKmTsEnpr3Q.png?x-oss-process=style/dapp-logo'

export default {
  name: 'Popup',
  components: {
    Alert,
    Title,
    P,
    Icon,
    GasControl,
    Container,
    Separator,
    BottomBar
  },
  filters: { fromZil, toConversion, toAddress },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS,
      DEFAULT_GAS_FEE,
      ICON_VARIANTS,
      BOTTOM_BAR,
      TEST_URL,
      tx: {}
    }
  },
  computed: {
    ...mapState('settings', [
      'defaultGas'
    ])
  },
  methods: {
    onCallFrom() { },
    setGasTx() { },
    onEvent(event) { }
  }
}
</script>

<style lang="scss">
.Popup {
  &__from,
  &__to {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 80px;
    font-size: 13px;
  }

  &__wrapper {
    display: grid;
    grid-gap: 15px;
    align-items: center;
    justify-items: center;

    padding: 15px 30px 30px 30px;
  }

  &__amount {
    display: flex;
    justify-content: space-between;

    width: 100%;
    max-width: 250px;
    font-size: 15px;
    line-height: 0;
  }

  &__details {
    position: fixed;
    bottom: 130px;
    right: 30px;

    cursor: pointer;

    display: grid;
    grid-template-columns: 1fr 40px;
    grid-gap: 10px;
  }

  &__to {
    position: fixed;
    bottom: 40px;
  }
}
</style>
