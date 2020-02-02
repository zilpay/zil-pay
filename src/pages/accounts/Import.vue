<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <Tabs
        v-model="tabs"
        :elements="TABS"
      />
      <RadioGroup
        v-model="radioGroup.model"
        :title="radioGroup.radioGroupTitle"
        :elements="radioGroup.elements"
      />
    </Container>
    <Alert :class="b('info')">
      <P>
        Imported accounts will not be associated with your originally created ZilPay account seedphrase.
      </P>
      <Input
        title="PrivateKey"
        round
      />
    </Alert>
    <BottomBar
      :elements="BOTTOM_BAR"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import Alert from '@/components/Alert'
import P from '@/components/P'
import Input from '@/components/Input'
import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'
import Tabs from '@/components/Tabs'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'

const EVENTS = {
  connect: uuid(),
  import: uuid(),
  cancel: uuid()
}
const BOTTOM_BAR = [
  {
    value: 'CANCEL',
    event: EVENTS.cancel,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  },
  {
    value: 'IMPORT',
    event: EVENTS.import,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]
const TABS = [
  {
    name: 'Import',
    event: EVENTS.import
  },
  {
    name: 'Connect',
    event: EVENTS.connect
  }
]
const RADIO_ELEMENTS = [
  'PrivateKey',
  'JSON file.'
]

export default {
  name: 'Import',
  components: {
    BottomBar,
    Tabs,
    TopBar,
    Container,
    RadioGroup,
    Alert,
    P,
    Input
  },
  data() {
    return {
      BOTTOM_BAR,
      SIZE_VARIANS,
      TABS,

      tabs: 0,
      radioGroup: {
        radioGroupTitle: 'Select Type:',
        elements: RADIO_ELEMENTS,
        model: RADIO_ELEMENTS[0]
      }
    }
  },
  methods: {
    onEvent() {}
  }
}
</script>

<style lang="scss">
.Import {
  &__wrapper {
    display: grid;
    grid-gap: 30px;
    justify-items: center;

    /* top | right | bottom | left */
    padding: 15px 15px 40px 15px;
  }

  &__info {
    line-height: 20px;
    font-size: 15px;

    height: 110px;
  }
}
</style>
