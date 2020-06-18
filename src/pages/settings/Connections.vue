<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <Button
        :color="COLOR_VARIANTS.warning"
        :disabled="!dappsList || dappsList.length < 1"
        round
        block
        @click="setEmptyDappList"
      >
        Clear
      </Button>
    </Container>
    <div
      v-for="(item, index) of dapps"
      :key="index"
      :class="b('list')"
    >
      <Item
        :src="item.icon"
        :trash="!item.default"
        pointer
        @click="linkToDomain(item.domain)"
        @remove="setRemoveDappList(item)"
      >
        <P :size="SIZE_VARIANS.xs">
          {{ item.title }}
        </P>
      </Item>
      <Separator v-show="index < dapps.length - 1"/>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_TYPE
} from '@/config'

import TopBar from '@/components/TopBar'
import Button from '@/components/Button'
import Container from '@/components/Container'
import P from '@/components/P'
import Item from '@/components/Item'

import LinkMixin from '@/mixins/links'

export default {
  name: 'Connections',
  mixins: [LinkMixin],
  components: {
    TopBar,
    Button,
    Container,
    Item,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      ICON_TYPE,

      defaultList: [
        {
          domain: 'https://zilpay.xyz/app/unstoppabledomains',
          icon: '/icons/unstoppable-logo.svg',
          title: 'Blockchain domains',
          default: true
        },
        {
          domain: 'https://zilpay.xyz/app/Editor',
          icon: '/icons/scilla-logo.png',
          title: 'Scilla IDE',
          default: true
        },
        {
          domain: 'https://zilpay.xyz/app/roll',
          icon: '/icons/roll.svg',
          title: 'Roll game',
          default: true
        }
      ]
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.dappsList
    ]),

    dapps() {
      return this.defaultList.concat(this.dappsList)
    }
  },
  methods: {
    ...mapMutations(settingsStore.STORE_NAME, [
      settingsStore.MUTATIONS_NAMES.setEmptyDappList,
      settingsStore.MUTATIONS_NAMES.setRemoveDappList
    ])
  }
}
</script>

<style lang="scss">
.Connections {
  &__wrapper {
    display: grid;
    justify-items: center;
    padding-top: 15px;
    padding-bottom: 30px;
  }

  &__list {
    display: grid;
    justify-content: center;
    align-items: center;

    width: 360px;
    height: 60px;
  }
}
</style>
