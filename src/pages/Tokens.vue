<template>
  <div :class="b()">
    <Top />
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.md">
        {{ $options.name }}
      </Title>
      <ul :class="b('scroll')">
        <li
          v-for="(t, index) of tokens"
          :key="index"
          :class="b('item')"
        >
          <Icon
            :type="ICON_TYPE.auto"
            :src="t.icon"
          />
          <div>
            <div :class="b('balance')">
              <Title
                :size="SIZE_VARIANS.md"
                :font="FONT_VARIANTS.regular"
              >
                {{ t.balance }}
              </Title>
              <P :font="FONT_VARIANTS.bold">
                {{ t.symbol }}
              </P>
            </div>
            <div :class="b('balance')">
              <Title
                :size="SIZE_VARIANS.sm"
                :font="FONT_VARIANTS.regular"
              >
                {{ t.balance | toConversion(getRate) }}
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
        </li>
      </ul>
    </div>
    <BottomBar />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import settingsStore from '@/store/settings'

import {
  COLOR_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_TYPE,
  ICON_VARIANTS
} from '@/config'

import Top from '@/components/Top'
import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'
import SvgInject from '@/components/SvgInject'

import { toConversion } from '@/filters'

export default {
  name: 'Tokens',
  filters: { toConversion },
  components: {
    Top,
    Title,
    Icon,
    SvgInject,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      ICON_VARIANTS,

      tokens: [
        {
          symbol: 'ZIL',
          balance: '300',
          icon: 'https://static.tildacdn.com/tild3838-3839-4431-a330-396431353063/mmenu_logos-02.svg',
          name: 'Zilliqa coin'
        }
      ]
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.currency
    ]),
    ...mapGetters(settingsStore.STORE_NAME, [
      settingsStore.GETTERS_NAMES.getRate
    ])
  }
}
</script>

<style lang="scss">
.Tokens {
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__wrapper {
    margin-top: 30px;

    & > .Title {
      text-align: center;
    }
  }

  &__item {
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
  }

  &__balance {
    width: 150px;
    display: flex;
    align-items: center;

    font-size: 18px;

    & > .P {
      margin-left: 5px;
    }
  }

  &__scroll {
    display: grid;
    grid-gap: 10px;

    padding: 0;
    margin-top: 10px;

    overflow-y: scroll;
    height: calc(100vh - 250px);
    min-width: 300px;
  }
}
</style>
