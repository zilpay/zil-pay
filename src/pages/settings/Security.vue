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
    </div>
    <BottomModal v-model="modals.key">
      <BackModal
        v-if="local.REVEAL_KEY"
        :name="local.REVEAL_KEY"
      />
      <SecureModal modalType="0"/>
    </BottomModal>
    <BottomModal v-model="modals.seed">
      <BackModal
        v-if="local.REVEAL_PHRASE"
        :name="local.REVEAL_PHRASE"
      />
      <SecureModal modalType="1"/>
    </BottomModal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import { COLOR_VARIANTS } from '@/config'
import { DEFAULT } from 'config'

import TopBar from '@/components/TopBar'
import BottomModal from '@/components/BottomModal'
import SecureModal from '@/views/SecureModal'
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
    BottomModal
  },
  data() {
    return {
      COLOR_VARIANTS,
      DEFAULT,

      modals: {
        key: false,
        seed: false
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
    min-height: 400px;
    padding-left: 30px;
    padding-right: 30px;

    & > .Button {
      min-width: 260px;
      min-height: 46px;
      font-size: 18px;
    }
  }
}
</style>
