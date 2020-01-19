<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('recipient')">
      <Title :size="SIZE_VARIANS.sm">
        {{ ALERT_TITLE }}
      </Title>
      <Input :placeholder="INPUT_PLACEHOLDER"/>
    </Alert>
    <div v-for="(action, index) of ACTIONS" :key="index">
      <Item
        pointer
        @click="onEvent(action.event)"
      >
        <Title
          :class="b('item-action')"
          :variant="COLOR_VARIANTS.info"
          :font="FONT_VARIANTS.light"
        >
          {{ action.name }}
        </Title>
      </Item>
      <Separator v-show="index < ACTIONS.length - 1"/>
    </div>
    <form :class="b('amount-form')">
      <Input
        v-model="amount"
        :type="INPUT_TYPES.number"
        title="Amount ZIL."
        pattern="[0-9]*"
        required
      />
      <Button
        :color="COLOR_VARIANTS.warning"
        round
        block
      >
        max
      </Button>
    </form>
    <BottomBar
      :elements="BOTTOM_BAR"
      @click="onEvent"
    />
    <BottomModal v-model="modal">
      account
    </BottomModal>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { SIZE_VARIANS, COLOR_VARIANTS, FONT_VARIANTS } from '@/config'

import Home from '@/pages/Home'

import TopBar from '@/components/TopBar'
import BottomBar from '@/components/BottomBar'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import Button from '@/components/Button'
import Input, { INPUT_TYPES } from '@/components/Input'
import Item from '@/components/Item'
import Separator from '@/components/Separator'
import BottomModal from '@/components/BottomModal'

const ALERT_TITLE = 'Add recipient'
const INPUT_PLACEHOLDER = 'Select, public address (zil1), or ZNS'
const EVENTS = {
  send: uuid(),
  cancel: uuid(),
  accounts: uuid(),
  contacts: uuid()
}

const ACTIONS = [
  {
    name: 'Transfer between my accounts.',
    event: EVENTS.accounts
  },
  {
    name: 'Transfer to my contacts.',
    event: EVENTS.contacts
  }
]

const BOTTOM_BAR = [
  {
    value: 'CANCEL',
    event: EVENTS.cancel,
    size: SIZE_VARIANS.sm,
    variant: COLOR_VARIANTS.primary,
    uuid: uuid()
  },
  {
    value: 'SEND',
    event: EVENTS.send,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]

export default {
  name: 'Send',
  components: {
    TopBar,
    BottomBar,
    BottomModal,
    Alert,
    Title,
    Input,
    Item,
    Separator,
    Button,
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      INPUT_TYPES,
      ALERT_TITLE,
      INPUT_PLACEHOLDER,
      ACTIONS,
      BOTTOM_BAR,

      amount: 0,
      modal: false
    }
  },
  methods: {
    onEvent(event) {
      switch (event) {
      case EVENTS.send:
        console.log(event)
        break
      case EVENTS.cancel:
        this.$router.push({ name: Home.name })
        break
      case EVENTS.accounts:
        this.modal = true
        break
      case EVENTS.contacts:
        this.modal = true
        break
      default:
        break
      }
    }
  }
}
</script>

<style lang="scss">
.Send {
  &__recipient {
    min-height: 80px;
  }

  &__item-action {
    font-size: 15px;
  }

  &__amount-form {
    display: grid;
    grid-template-columns: 1fr 60px;
    grid-gap: 5px;
    align-items: center;

    padding-left: 30px;
    padding-right: 30px;
    padding-top: 194px;
  }
}
</style>
