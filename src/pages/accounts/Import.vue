<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <Tabs
        v-model="tabs"
        :elements="tabElements"
      />
      <RadioGroup
        v-model="radioGroup.model"
        :title="radioGroup.radioGroupTitle"
        :elements="radioGroup.elements"
      />
    </Container>
    <Alert :class="b('info')">
      <P>
        {{ local.IMPORT_INFO }}
      </P>
      <Input
        placeholder="PrivateKey"
        round
      />
    </Alert>
    <BottomBar
      :elements="bottomBar"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import { mapState } from 'vuex'
import uiStore from '@/store/ui'

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
      SIZE_VARIANS,

      tabs: 0,
      radioGroup: {
        radioGroupTitle: 'Select Type:',
        elements: RADIO_ELEMENTS,
        model: RADIO_ELEMENTS[0]
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),

    bottomBar() {
      return [
        {
          value: this.local.CANCEL,
          event: EVENTS.cancel,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
          uuid: uuid()
        },
        {
          value: this.local.IMPORT,
          event: EVENTS.import,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm,
        }
      ]
    },
    tabElements() {
      return [
        {
          name: this.local.IMPORT,
          event: EVENTS.import
        },
        {
          name: this.local.CONNECT,
          event: EVENTS.connect
        }
      ]
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
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    line-height: 20px;
    font-size: 15px;

    height: 110px;
  }
}
</style>
