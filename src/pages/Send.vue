<template>
  <div :class="b()">
    <TopBar />
    <Alert :class="b('recipient')">
      <Title :size="SIZE_VARIANS.sm">
        {{ ALERT_TITLE }}
      </Title>
      <Input
        :value="address"
        :placeholder="INPUT_PLACEHOLDER"
        round
        autofocus
      />
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
        round
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
    <BottomModal v-model="accountModal">
      <div
        v-for="(acc, index) of identities"
        :key="index"
        @click="onAddress(acc.address)"
      >
        <Item pointer arrow>
          <Title
            :font="FONT_VARIANTS.light"
            :size="SIZE_VARIANS.sm"
          >
            {{ acc.name }}
          </Title>
        </Item>
        <Separator v-show="index < identities.length - 1"/>
      </div>
    </BottomModal>
    <BottomModal v-model="contactModal">
      <div
        v-for="(acc, index) of contactList"
        :key="index"
        @click="onAddress(acc.address)"
      >
        <Item pointer arrow>
          <Title
            :font="FONT_VARIANTS.light"
            :size="SIZE_VARIANS.sm"
          >
            {{ acc.name }}
          </Title>
        </Item>
        <Separator v-show="index < contactList.length - 1"/>
      </div>
    </BottomModal>
  </div>
</template>

<script>
import { uuid } from 'uuidv4'
import { mapState } from 'vuex'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  FONT_VARIANTS,
  ADDRESS_FORMAT_VARIANTS
} from '@/config'

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

import { toAddress } from '@/filters'

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
  filters: { toAddress },
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
      address: null,
      accountModal: false,
      contactModal: false
    }
  },
  computed: {
    ...mapState('accounts', [
      'identities'
    ]),
    ...mapState('contacts', [
      'contactList'
    ])
  },
  methods: {
    onEvent(event) {
      switch (event) {
      case EVENTS.send:
        break
      case EVENTS.cancel:
        this.$router.push({ name: Home.name })
        break
      case EVENTS.accounts:
        this.accountModal = true
        break
      case EVENTS.contacts:
        this.contactModal = true
        break
      default:
        break
      }
    },
    onAddress(address) {
      this.address = toAddress(
        address,
        ADDRESS_FORMAT_VARIANTS.bech32,
        false
      )
      this.accountModal = false
      this.contactModal = false
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
    align-items: self-end;

    padding-left: 30px;
    padding-right: 30px;
    padding-top: 194px;
  }
}
</style>
