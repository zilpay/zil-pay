<template>
  <div :class="b()">
    <Top />
    <AddMenu @click="tokenModal = true" />
    <div :class="b('wrapper')">
      <Title :size="SIZE_VARIANS.md">
        {{ $options.name }}
      </Title>
      <ul :class="b('scroll')">
        <li
          v-for="(t, index) of tokens"
          :key="index"
        >
          <TokenCard
            :balance="t.balance"
            :name="t.name"
            :symbol="t.symbol"
          />
        </li>
      </ul>
    </div>
    <BottomBar />
    <BottomModal v-model="tokenModal">
      <BackModal
        v-if="tokenModal"
        :name="local.ADD_TOKEN"
        @click="tokenModal = false"
      />
      <TokenCreater v-if="tokenModal" />
    </BottomModal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'
import tokenStore from '@/store/token'

import {
  COLOR_VARIANTS,
  FONT_VARIANTS,
  SIZE_VARIANS,
  ICON_TYPE,
  ICON_VARIANTS
} from '@/config'

import Top from '@/components/Top'
import Title from '@/components/Title'
import AddMenu from '@/components/AddMenu'
import TokenCard from '@/components/TokenCard'
import TokenCreater from '@/components/TokenCreater'
import BottomModal from '@/components/BottomModal'
import BackModal from '@/components/BackModal'

export default {
  name: 'Tokens',
  components: {
    Top,
    Title,
    TokenCard,
    TokenCreater,
    BottomModal,
    BackModal,
    AddMenu
  },
  data() {
    return {
      SIZE_VARIANS,
      ICON_TYPE,
      COLOR_VARIANTS,
      FONT_VARIANTS,
      ICON_VARIANTS,

      tokenModal: false
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(tokenStore.STORE_NAME, [
      tokenStore.STATE_NAMES.tokens,
      tokenStore.STATE_NAMES.selectedcoin
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

  &__scroll {
    display: flex;
    flex-direction: column;

    padding: 0;
    list-style: none;

    overflow-y: scroll;
    height: calc(100vh - 250px);
    min-width: 300px;

    & > li {
      margin-top: 10px;
    }
  }
}
</style>
