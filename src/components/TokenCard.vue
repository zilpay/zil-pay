<template>
  <div :class="b({ selected })">
    <Icon
      :type="ICON_TYPE.auto"
      :src="tokenImage"
    />
    <div>
      <div>
        <Title
          :size="SIZE_VARIANS.md"
          :font="FONT_VARIANTS.regular"
        >
          {{ balance }}
        </Title>
        <P :font="FONT_VARIANTS.bold">
          {{ symbol }}
        </P>
      </div>
      <div>
        <Title
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
        >
          {{ balance | toConversion(getRate) }}
        </Title>
        <P
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.bold"
        >
          {{ currency }}
        </P>
      </div>
    </div>
    <SvgInject :variant="ICON_VARIANTS.arrow" />
  </div>
</template>

<script>
import { API } from 'config'

import { mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'

import {
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_VARIANTS,
  ICON_TYPE
} from '@/config'

import Title from '@/components/Title'
import P from '@/components/P'
import SvgInject from '@/components/SvgInject'
import Icon from '@/components/Icon'

import { toConversion } from '@/filters'

export default {
  name: 'TokenCard',
  filters: { toConversion },
  components: {
    SvgInject,
    Icon,
    P,
    Title
  },
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    balance: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      FONT_VARIANTS,
      ICON_VARIANTS,
      ICON_TYPE,
      SIZE_VARIANS,
      API
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currency
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ]),

    tokenImage() {
      return `${this.API.ZRC2_API}/${this.symbol}.png`.toLowerCase()
    }
  }
}
</script>

<style lang="scss">
.TokenCard {
  display: flex;
  align-items: center;
  justify-content: space-between;

  max-height: 60px;
  padding: 10px;

  background-color: var(--accent-color-second);
  border-radius: 10px;
  cursor: pointer;

  img {
    max-width: 30px;
    height: auto;
  }

  svg {
    transform: rotate(180deg);

    path {
      stroke: var(--accent-color-primary);
    }
  }

  & > div {
    width: 200px;
  }

  & > div > div {
    width: 150px;
    display: flex;
    align-items: center;

    font-size: 18px;

    & > .P {
      margin-left: 5px;
    }
  }

  &_selected {
    border: 2px solid var(--accent-color-primary);
  }
}
</style>
