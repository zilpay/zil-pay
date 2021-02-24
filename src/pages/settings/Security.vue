<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <RadioGroup
        :value="getCurrent"
        :elements="getHours"
        @input="setLockTime"
      >
        {{ local.AUTO_LOGOUT_HOURS }} ({{ local.HOURS }})
      </RadioGroup>
      <Button
        v-show="getCurrentAccount && !getCurrentAccount.hwType"
        :color="COLOR_VARIANTS.negative"
        round
        @click="modals.key = true"
      >
        {{ local.REVEAL_KEY }}
      </Button>
      <Button
        :color="COLOR_VARIANTS.negative"
        round
        @click="modals.seed = true"
      >
        {{ local.REVEAL_PHRASE }}
      </Button>
      <Button
        :color="COLOR_VARIANTS.negative"
        round
        @click="modals.keystore = true"
      >
        {{ local.REVEAL_KEYSTORE }}
      </Button>
      <Button
        :color="COLOR_VARIANTS.negative"
        round
        @click="modals.connect = true"
      >
        {{ local.MOBILE_SYNC }}
      </Button>
    </div>
    <BottomModal
      v-model="modals.key"
      pure
    >
      <BackModal
        v-if="local.REVEAL_KEY"
        :name="local.REVEAL_KEY"
        back
        @click="modals.key = false"
      />
      <SecureModal
        v-if="modals.key"
        modalType="0"
      />
    </BottomModal>
    <BottomModal
      v-model="modals.seed"
      pure
    >
      <BackModal
        v-if="local.REVEAL_PHRASE"
        :name="local.REVEAL_PHRASE"
        back
        @click="modals.seed = false"
      />
      <SecureModal
        v-if="modals.seed"
        modalType="1"
      />
    </BottomModal>
    <BottomModal
      v-model="modals.keystore"
      pure
    >
      <BackModal
        v-if="local.REVEAL_KEYSTORE"
        :name="local.REVEAL_KEYSTORE"
        back
        @click="modals.keystore = false"
      />
      <SecureModal
        v-if="modals.keystore"
        modalType="2"
        @close="modals.keystore = false"
      />
    </BottomModal>
    <BottomModal
      v-model="modals.connect"
      pure
    >
      <BackModal
        v-if="local.MOBILE_SYNC"
        :name="local.MOBILE_SYNC"
        back
        @click="modals.connect = false"
      />
      <WalletConnectModal
        v-if="modals.connect"
        @close="modals.connect = false"
      />
    </BottomModal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import accountsStore from '@/store/accounts'

import { COLOR_VARIANTS } from '@/config'
import { DEFAULT } from 'config'

import TopBar from '@/components/TopBar'
import BottomModal from '@/components/BottomModal'
import SecureModal from '@/views/SecureModal'
import WalletConnectModal from '@/views/WalletConnectModal'
import RadioGroup from '@/components/RadioGroup'
import BackModal from '@/components/BackModal'
import Button from '@/components/Button'

export default {
  name: 'Security',
  components: {
    TopBar,
    RadioGroup,
    Button,
    BackModal,
    SecureModal,
    WalletConnectModal,
    BottomModal
  },
  data() {
    return {
      COLOR_VARIANTS,
      DEFAULT,

      modals: {
        key: false,
        seed: false,
        keystore: false,
        connect: false
      }
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.lockTime
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getHours,
      settingsStore.GETTERS_NAMES.getCurrent
    ]),
    ...mapGetters(accountsStore.STORE_NAME, [
      accountsStore.GETTERS_NAMES.getCurrentAccount
    ])
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setLockTime
    ]),

    onDefault() {
      this.setLockTime(DEFAULT.TIME_BEFORE_LOCK)
    }
  }
}
</script>

<style lang="scss">
.Security {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    min-height: 502px;
    padding-left: 30px;
    padding-right: 30px;

    & > .Button {
      min-width: 260px;
      min-height: 46px;
      font-size: 18px;
    }
  }

  & > .BottomModal > .BottomModal__social {
    margin: 10px;
  }
}
</style>
