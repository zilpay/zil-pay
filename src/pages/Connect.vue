<template>
  <div :class="b()">
    <Alert>
      <Container
        v-if="getCurrentAccount"
        :class="b('account')"
      >
        <Title :size="SIZE_VARIANS.sm">
          {{ name }}
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
        {{ connect.title }} {{ local.CONNECT_INFO }}
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

import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'
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
import { removeConnect, Background } from '@/services'

const { window } = global
const EVENTS = {
  connect: uuid(),
  cancel: uuid()
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
    },
    name() {
      if (this.getCurrentAccount.name) {
        return this.getCurrentAccount.name
      } else if (this.getCurrentAccount.isImport) {
        return `${this.local.IMPORTED} ${this.getCurrentAccount.index}`
      } else if (this.getCurrentAccount.hwType) {
        return `${this.getCurrentAccount.hwType} ${this.getCurrentAccount.index}`
      }

      return `${this.local.ACCOUNT} ${this.account.index}`
    }
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setDappList,
      settingsStore.MUTATIONS_NAMES.setConnect
    ]),
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.onUpdateDappList
    ]),

    async onReject() {
      console.log('onReject', this.connect.uuid)
      const bg = new Background()

      await bg.sendResponseConnection(false, this.connect.uuid)
      await removeConnect()

      this.setConnect({})
      window.window.close()
    },
    async onConfirm() {
      await this.onUpdateDappList()
      window.window.close()
    },

    onEvent(event) {
      switch (event) {
      case EVENTS.connect:
        this.onConfirm()
        break
      case EVENTS.cancel:
        this.onReject()
        break
      default:
        break
      }
    }
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
