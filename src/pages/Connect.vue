<template>
  <div :class="b()">
    <Alert>
      <Container :class="b('account')">
        <Title :size="SIZE_VARIANS.sm">
          {{ getCurrentAccount.name }}
        </Title>
          <P>
            {{ getCurrentAccount.address | toAddress(addressFormat, false) }}
          </P>
      </Container>
    </Alert>
    <Container :class="b('wrapper')">
      <Icon
        :src="CONNECT_TEST.icon"
        :type="ICON_TYPE.auto"
        width="40"
        height="40"
      />
      <Title :size="SIZE_VARIANS.md">
        {{ CONNECT_TEST.domain }}
      </Title>
      <P>
        {{ CONNECT_TEST.title }} {{ local.CONNECT_INFO }}
      </P>
    </Container>
    <Alert :class="b('about-connect')">
      <P
        :class="b('info')"
        :font="FONT_VARIANTS.light"
      >
        {{ local.CONNECT_DIS }}
      </P>
    </Alert>
    <BottomBar
      :elements="bottomBar"
      @click="onEvent"
    />
  </div>
</template>

<script>
import { uuid } from 'uuidv4'

import { mapGetters, mapState } from 'vuex'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_TYPE,
  FONT_VARIANTS
} from '@/config'

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
const CONNECT_TEST = {
  domain: 'rocketgame.io',
  icon: 'https://rocketgame.io/favicon.ico',
  title: 'RocketGame',
  uuid: '574ed57d-08bf-4118-b372-014a45995a66'
}
export default {
  name: 'Connect',
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
      ICON_TYPE,
      CONNECT_TEST
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat
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
    onEvent(event) {}
  }
}
</script>

<style lang="scss">
.Connect {
  &__account {
    padding-left: 15px;
    padding-right: 15px;

    font-size: 15px;
  }

  &__wrapper {
    display: grid;
    grid-gap: 30px;
    justify-items: center;

    /* top | right | bottom | left */
    padding: 30px 15px 100px 15px;
  }

  &__info {
    line-height: 18px;
    font-size: 15px;
  }

  &__about-connect {
    height: 100px;
  }
}
</style>
