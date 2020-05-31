<template>
  <div :class="b()">
    <Alert>
      <Container
        v-if="getCurrentAccount"
        :class="b('header')"
      >
        <Title :size="SIZE_VARIANS.md">
          {{ local.SIGN_REQ }}
        </Title>
        <P nowrap>
          {{ getCurrentAccount.address | toAddress(addressFormat, true) }}
        </P>
      </Container>
    </Alert>
    <Container :class="b('wrapper')">
      <Icon
        v-if="getCurrent.icon"
        :src="getCurrent.icon"
        :type="ICON_TYPE.auto"
        :class="b('icon')"
        width="40"
        height="40"
      />
      <Title :size="SIZE_VARIANS.md">
        {{ getCurrent.title }}
      </Title>
      <P>
        {{ local.SIGN_DESC }}
      </P>
    </Container>
    <P
      :class="b('error-msg')"
      :variant="COLOR_VARIANTS.danger"
      :font="FONT_VARIANTS.regular"
      :size="SIZE_VARIANS.sm"
      centred
    >
      {{ error }}
    </P>
    <Container>
      <Textarea
        :class="b('msg')"
        :value="getCurrent.message"
        readonly
      />
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
  FONT_VARIANTS,
  HW_VARIANTS
} from '@/config'

import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import transactionsStore from '@/store/transactions'

import Popup from '@/pages/Popup'

import Icon from '@/components/Icon'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import Textarea from '@/components/Textarea'
import BottomBar from '@/components/BottomBar'
import Container from '@/components/Container'

import { Background, ledgerSignMessage } from '@/services'
import { toAddress } from '@/filters'

const { window } = global

const EVENTS = {
  sign: uuid(),
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
    Icon,
    Textarea
  },
  filters: { toAddress },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      ICON_TYPE,

      error: null
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.confirmationTx
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.addressFormat,
      settingsStore.STATE_NAMES.connect
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ]),
    ...mapGetters(transactionsStore.STORE_NAME, [
      transactionsStore.GETTERS_NAMES.getCurrent
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
          value: this.local.SIGN,
          event: EVENTS.sign,
          variant: COLOR_VARIANTS.primary,
          size: SIZE_VARIANS.sm
        }
      ]
    }
  },
  methods: {
    ...mapMutations(transactionsStore.STORE_NAME, [
      transactionsStore.MUTATIONS_NAMES.setPopConfirmTx
    ]),
    ...mapActions(transactionsStore.STORE_NAME, [
      transactionsStore.ACTIONS_NAMES.setRejectedLastTx
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ]),

    async onReject() {
      this.setLoad()

      if (this.getCurrent && this.getCurrent.uuid) {
        await this.setRejectedLastTx()
      }

      await this.popupClouse()
      this.setLoad()
    },
    async onConfirm() {
      let signature = null
      const bg = new Background()

      try {
        this.setLoad()

        const account = this.getCurrentAccount
        const { message } = this.getCurrent

        if (account.hwType && account.hwType === HW_VARIANTS.ledger) {
          signature = await ledgerSignMessage(account.index, message)
        }

        console.log(signature)

        await bg.sendForConfirmMessage({
          ...this.getCurrent,
          signature
        })

        this.popupClouse()
      } catch (err) {
        this.error = err.message
      } finally {
        this.setLoad()
      }
    },
    async popupClouse() {
      await this.setPopConfirmTx()

      if (!this.confirmationTx || this.confirmationTx.length === 0) {
        window.close()
      }
    },
    onEvent(event) {
      switch (event) {
      case EVENTS.sign:
        this.onConfirm()
        break
      case EVENTS.cancel:
        this.onReject()
        break
      default:
        break
      }
    }
  },
  updated() {
    if (this.getCurrent && !this.getCurrent.message) {
      this.$router.push({ name: Popup.name })
    }
  }
}
</script>

<style lang="scss">
.SignMessage {
  min-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__header {
    margin: 10px;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-top: 10%;
    margin-bottom: 10%;
  }

  &__msg {
    min-width: 360px;
  }

  &__icon {
    margin-top: 10%;
    margin-bottom: 10%;
  }

  &__error-msg {
    margin-bottom: 5%;
  }
}
</style>
