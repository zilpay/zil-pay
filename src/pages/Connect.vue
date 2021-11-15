<template>
  <div :class="b()">
    <Alert>
      <div v-if="getCurrentAccount">
        <Title :size="SIZE_VARIANS.sm">
          {{ getAccountName(getCurrentAccount) }}
        </Title>
          <P :size="SIZE_VARIANS.xs">
            {{ getCurrentAccount.address | toAddress(addressFormat, false) }}
          </P>
      </div>
    </Alert>
    <div :class="b('wrapper')">
      <img
        :src="connect.icon"
        width="40"
        height="40"
        @error="imageUnloaded"
      >
      <Title :size="SIZE_VARIANS.md">
        {{ connect.domain }}
      </Title>
      <P>
        {{ connect.title }} {{ local.CONNECT_INFO }}
      </P>
    </div>
    <Alert>
      <P :font="FONT_VARIANTS.light">
        {{ local.CONNECT_DIS }}
      </P>
    </Alert>
    <Tabs
      :elements="tabElements"
      @input="onEvent"
    />
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'
import accountsStore from '@/store/accounts'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import { DEFAULT } from 'config'
import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_TYPE,
  FONT_VARIANTS
} from '@/config'

import HomePage from '@/pages/Home'

import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'
import Tabs from '@/components/Tabs'

import { toAddress } from '@/filters'
import AccountMixin from '@/mixins/account'
import { removeConnect, Background } from '@/services'

const { window } = global

export default {
  name: 'Connect',
  mixins: [AccountMixin],
  components: {
    Alert,
    Title,
    P,
    Tabs
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

    tabElements() {
      return [
        {
          name: this.local.CANCEL
        },
        {
          name: this.local.CONNECT
        }
      ]
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
      const bg = new Background()

      await bg.sendResponseConnection(false, this.connect.uuid)
      await removeConnect()

      this.setConnect({})
      this.popupClouse()
    },
    async onConfirm() {
      const bg = new Background()

      await bg.sendResponseConnection(true, this.connect.uuid)
      await this.onUpdateDappList()
      this.popupClouse()
    },
    popupClouse() {
      window.close()
      this.$router.push({ name: HomePage.name })
    },
    onEvent(event) {
      switch (event) {
      case 1:
        this.onConfirm()
        break
      case 0:
        this.onReject()
        break
      default:
        break
      }
    },
    imageUnloaded(event) {
      event.target.style.display = 'none'
    }
  },
  mounted() {
    setTimeout(() => this.onReject(), DEFAULT.POPUP_CALL_TIMEOUT)
  }
}
</script>

<style lang="scss">
.Connect {
  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    padding-top: 30px;

    min-height: 200px;
  }

  & > .Alert {
    margin-top: 30px;
  }

  & > .Tabs {
    margin-top: 20px;
  }
}
</style>
