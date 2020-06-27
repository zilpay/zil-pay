<template>
  <div :class="b()">
    <TopBar/>
    <P
      :class="b('reset', 'pointer')"
      @click="onDefault"
    >
      {{ local.RESET }}
    </P>
    <div :class="b('wrapper')">
      <GasControl
        :value="defaultGas"
        :DEFAULT="DEFAULT_GAS_FEE"
        @input="setGas"
      />
      <RadioGroup
        :value="addressFormat"
        :title="local.ADDR_FORMATS"
        :elements="addressFormatItems"
        @input="setAddressFormat"
      >
        {{ local.ADDR_FORMATS }}:
      </RadioGroup>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import { DEFAULT_GAS_FEE } from 'config/zilliqa'

import TopBar from '@/components/TopBar'
import GasControl from '@/components/GasControl'
import RadioGroup from '@/components/RadioGroup'
import P from '@/components/P'

export default {
  name: 'Advanced',
  components: {
    TopBar,
    GasControl,
    RadioGroup,
    P
  },
  data() {
    return {
      DEFAULT_GAS_FEE
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.defaultGas,
      settingsStore.STATE_NAMES.addressFormatItems,
      settingsStore.STATE_NAMES.addressFormat
    ])
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setDefaultGas,
      settingsStore.MUTATIONS_NAMES.setGas,
      settingsStore.MUTATIONS_NAMES.setAddressFormat
    ]),

    onDefault() {
      this.setDefaultGas()
      this.setAddressFormat(this.addressFormatItems[0])
    }
  }
}
</script>

<style lang="scss">
.Advanced {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__reset {
    position: absolute;
    right: 20px;
    top: 20px;
    text-decoration: underline;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    min-height: 300px;
    margin-top: 40px;

    & > .RadioGroup {
      margin-top: 30px;
    }
  }
}
</style>
