<template>
  <div :class="b()">
    <Alert>
      <Container
        v-if="getCurrentAccount"
        :class="b('account')"
      >
        <Title :size="SIZE_VARIANS.md">
          Signature Request
        </Title>
        <P>
          {{ getCurrentAccount.address | toAddress(addressFormat, false) }}
        </P>
      </Container>
    </Alert>
    <Container :class="b('wrapper')">
      <Icon
        :src="connect.icon"
        :type="ICON_TYPE.auto"
        width="40"
        height="40"
      />
      <Title :size="SIZE_VARIANS.md">
        {{ connect.domain }}
      </Title>
      <P>
        Your signature is being requested
      </P>
    </Container>
    <BottomBar
      :elements="bottomBar"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_TYPE,
  FONT_VARIANTS
} from '@/config'

import { mapGetters, mapState } from 'vuex'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import Icon from '@/components/Icon'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import BottomBar from '@/components/BottomBar'
import Container from '@/components/Container'

import { toAddress } from '@/filters'

const EVENTS = {
  connect: uuid(),
  cancel: uuid()
}
export default {
  name: 'SignMessage',
  components: {
    Alert,
    Title,
    P,
    BottomBar,
    Container,
    Icon
  },
  filters: { toAddress },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      ICON_TYPE
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat,
      settingsStore.STATE_NAMES.connect
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),

    bottomBar() {
      return [
        {
          value: this.local.CANCEL,
          event: EVENTS.cancel,
          size: SIZE_VARIANS.sm,
          variant: COLOR_VARIANTS.primary
        },
        {
          value: this.local.CONNECT,
          event: EVENTS.connect,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
        }
      ]
    }
  },
  methods: {
    onEvent(event) {
      switch (event) {
      case EVENTS.connect:
        console.log('connect')
        break
      case EVENTS.cancel:
        console.log('cancel')
        break
      default:
        break
      }
    }
  }
}
</script>

<style lang="scss">
.SignMessage {
}
</style>
