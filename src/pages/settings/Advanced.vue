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
      <P
        :class="b('gas')"
        :size="SIZE_VARIANS.sm"
        :variant="COLOR_VARIANTS.primary"
      >
        {{ local.DEFAULT_GAS }}:
      </P>
      <GasSelector
        :value="defaultGas"
        :defaultValue="defaultGasValue"
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
import { mapState, mapMutations, mapActions } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import { DEFAULT_GAS_FEE } from 'config/zilliqa'
import { COLOR_VARIANTS, SIZE_VARIANS } from '@/config'

import TopBar from '@/components/TopBar'
import GasSelector from '@/components/GasSelecter'
import RadioGroup from '@/components/RadioGroup'
import P from '@/components/P'

export default {
  name: 'Advanced',
  components: {
    TopBar,
    GasSelector,
    RadioGroup,
    P
  },
  data() {
    return {
      DEFAULT_GAS_FEE,
      COLOR_VARIANTS,
      SIZE_VARIANS,
      defaultGasValue: JSON.stringify(DEFAULT_GAS_FEE)
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
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.onGetMinGasPrice
    ]),
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setDefaultGas,
      settingsStore.MUTATIONS_NAMES.setGas,
      settingsStore.MUTATIONS_NAMES.setAddressFormat
    ]),

    onDefault() {
      this.setDefaultGas()
      this.setAddressFormat(this.addressFormatItems[0])
    }
  },
  mounted() {
    this
      .onGetMinGasPrice()
      .then((gas) => this.defaultGasValue = JSON.stringify(gas))
  }
}
</script>

<style lang="scss">
.Advanced {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__gas {
    font-size: 20px;
  }

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

    margin-top: 40px;

    & > .RadioGroup {
      margin-top: 30px;
    }
  }
}
</style>
