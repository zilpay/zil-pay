<template>
  <div :class="b()">
    <TopBar close/>
    <div :class="b('wrapper')">
      <RadioGroup
        :value="currency"
        :title="local.CUR_CONVER"
        :elements="currencyItems"
        @input="setCurrency"
      >
        {{ local.CUR_CONVER }}:
      </RadioGroup>
      <RadioGroup
        :value="addressFormat"
        :title="local.ADDR_FORMATS"
        :elements="addressFormatItems"
        @input="setAddressFormat"
      >
        {{ local.ADDR_FORMATS }}:
      </RadioGroup>
      <div :class="b('btns')">
        <Button
          :disabled="(currency === currencyItems[0]) && (addressFormat === addressFormatItems[0])"
          round
          @click="onDefault"
        >
          {{ local.DEFAULT }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'
import transactionsStore from '@/store/transactions'

import { COLOR_VARIANTS } from '@/config'

import TopBar from '@/components/TopBar'
import RadioGroup from '@/components/RadioGroup'
import Button from '@/components/Button'

export default {
  name: 'General',
  components: {
    TopBar,
    RadioGroup,
    Button
  },
  data() {
    return {
      COLOR_VARIANTS
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currencyItems,
      settingsStore.STATE_NAMES.currency,
      settingsStore.STATE_NAMES.addressFormatItems,
      settingsStore.STATE_NAMES.addressFormat
    ]),
    ...mapState(transactionsStore.STORE_NAME, [
      transactionsStore.STATE_NAMES.transactions
    ])
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setCurrency,
      settingsStore.MUTATIONS_NAMES.setAddressFormat
    ]),

    onDefault() {
      this.setAddressFormat(this.addressFormatItems[0])
      this.setCurrency(this.currencyItems[0])
    }
  }
}
</script>

<style lang="scss">
.General {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 50vh;

    width: 40vw;
    min-width: 300px;
    min-height: 400px;

    padding-left: 100px;
  }
}
</style>
