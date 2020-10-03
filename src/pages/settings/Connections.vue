<template>
  <div :class="b()">
    <TopBar />
    <ul :class="b('scroll')">
      <li
        v-for="(item, index) of dappsList"
        :key="index"
      >
        <Icon
          :type="ICON_TYPE.auto"
          :icon="item.icon"
          @click="linkToDomain(item.domain)"
        />
        <div @click="linkToDomain(item.domain)">
          <P
            :class="b('info')"
            :size="SIZE_VARIANS.sm"
            :font="FONT_VARIANTS.bold"
          >
            {{ item.title }}
          </P>
          <P
            :class="b('info')"
            :size="SIZE_VARIANS.xs"
            nowrap
          >
            {{ item.description }}
          </P>
        </div>
        <div @click="setRemoveDappList(item)">
          <SvgInject :variant="ICON_VARIANTS.trash"/>
        </div>
      </li>
      <li v-show="!dappsList || dappsList.length === 0">
        <Title
          :size="SIZE_VARIANS.sm"
          :font="FONT_VARIANTS.regular"
          :variant="COLOR_VARIANTS.gray"
        >
          {{ local.HAS_NOT_CONNECTIONS }}
        </Title>
      </li>
    </ul>
    <Button
      v-show="dappsList && dappsList.length > 0"
      :color="COLOR_VARIANTS.negative"
      round
      block
      @click="setEmptyDappList"
    >
      {{ local.DELETE_ALL }}
    </Button>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import settingsStore from '@/store/settings'
import uiStore from '@/store/ui'

import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_TYPE,
  ICON_VARIANTS,
  FONT_VARIANTS
} from '@/config'

import TopBar from '@/components/TopBar'
import Button from '@/components/Button'
import P from '@/components/P'
import Title from '@/components/Title'
import Icon from '@/components/Icon'
import SvgInject from '@/components/SvgInject'

import LinkMixin from '@/mixins/links'

export default {
  name: 'Connections',
  mixins: [LinkMixin],
  components: {
    TopBar,
    Button,
    P,
    Icon,
    SvgInject,
    Title
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      ICON_TYPE,
      ICON_VARIANTS,
      FONT_VARIANTS
    }
  },
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.dappsList
    ]),
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
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
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: var(--app-background-color);

  &__scroll {
    display: flex;
    flex-direction: column;

    margin-top: 10px;
    padding: 0;
    padding: 10px;

    overflow-y: scroll;
    height: calc(100vh - 150px);
    min-width: 300px;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;

      list-style: none;
      max-height: 52px;
      margin-top: 10px;

      cursor: pointer;

      img {
        width: 30px;
        height: auto;
      }
    }
  }

  &__info {
    width: 200px;
  }
}
</style>
