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
        </li>
      </ul>
    </div>
    <BottomBar />
  </div>
</template>

<script>
import { COLOR_VARIANTS, FONT_VARIANTS, SIZE_VARIANS, ICON_TYPE } from '@/config'

import Top from '@/components/Top'
import Title from '@/components/Title'
import P from '@/components/P'
import Icon from '@/components/Icon'

export default {
  name: 'Tokens',
  components: {
    Top,
    Title,
    Icon,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      COLOR_VARIANTS,
      FONT_VARIANTS,

      tokens: [
        {
          symbol: 'ZIL',
          balance: '300',
          icon: 'https://static.tildacdn.com/tild3838-3839-4431-a330-396431353063/mmenu_logos-02.svg',
          name: 'Zilliqa coin'
        }
      ]
    }
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
    max-height: 70px;
    padding: 10px;

    img {
      max-width: 30px;
      height: auto;
    }
  }

  &__scroll {
    display: grid;
    grid-gap: 10px;

    margin-top: 10px;

    overflow-y: scroll;
    height: calc(100vh - 306px);
    min-width: 300px;
  }
}
</style>
