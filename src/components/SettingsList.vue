<template>
  <div
    v-show="show"
    :class="b()"
  >
    <div :class="b('wrapper')">
      <div
        :class="b('clsoe-btn')"
        @click="toggleSideBarSettings"
      >
        <SvgInject :variant="ICON_VARIANTS.close"/>
      </div>
      <Title :size="SIZE_VARIANS.md">
        {{ local.SETTINGS }}
      </Title>
      <ul :class="b('list')">
        <li
          v-for="(link, index) of LINK_LIST"
          :key="index"
          :class="b('item')"
        >
          <router-link :to="{ name: link.name }">
            <SvgInject :variant="link.icon"/>
            <P :size="SIZE_VARIANS.sm">
              {{ link.name }}
            </P>
          </router-link>
        </li>
      </ul>
    </div>
    <a
      :class="b('close-wrapper')"
      @click="toggleSideBarSettings"
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import modalStore from '@/store/modal'

import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'

import HomePage from '@/pages/Home'

import Title from '@/components/Title'
import P from '@/components/P'
import SvgInject from '@/components/SvgInject'

import General from '@/pages/settings/General'
import Advanced from '@/pages/settings/Advanced'
import Networks from '@/pages/settings/Networks'
import Connections from '@/pages/settings/Connections'
import Security from '@/pages/settings/Security'
import About from '@/pages/settings/About'
import Account from '@/pages/settings/Account'

const LINK_LIST = [
  {
    icon: ICON_VARIANTS.profile,
    name: Account.name
  },
  {
    icon: ICON_VARIANTS.gear,
    name: General.name
  },
  {
    icon: ICON_VARIANTS.setup,
    name: Advanced.name
  },
  {
    icon: ICON_VARIANTS.net,
    name: Networks.name
  },
  {
    icon: ICON_VARIANTS.link,
    name: Connections.name
  },
  {
    icon: ICON_VARIANTS.security,
    name: Security.name
  },
  {
    icon: ICON_VARIANTS.about,
    name: About.name
  }
]

export default {
  name: 'SettingsList',
  components: {
    Title,
    SvgInject,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      ICON_VARIANTS,

      LINK_LIST
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ]),
    ...mapState(modalStore.STORE_NAME, [
      modalStore.STATE_NAMES.sideBarSettings
    ]),

    show() {
      const { name } = this.$route

      return Boolean(this.sideBarSettings) && Boolean(name === HomePage.name)
    }
  },
  methods: {
    ...mapMutations(modalStore.STORE_NAME, [
      modalStore.MUTATIONS_NAMES.toggleSideBarSettings
    ])
  }
}
</script>

<style lang="scss">
.SettingsList {
  position: fixed;
  top: 0;
  bottom: 0;

  display: flex;

  height: 100%;
  width: 100%;
  z-index: 2;

  background-color: var(--opacity-bg-element-2);

  animation: fadeFull 0.2s;
  animation-timing-function: cubic-bezier(.3,.17,.23,.96);

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;

    min-width: 250px;
    padding-top: 100px;

    border-bottom-right-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);

    background-color: var(--app-background-color);

    animation: backInLeft 0.4s;
    animation-timing-function: cubic-bezier(.3,.17,.23,.96);

    opacity: 1;
  }

  &__clsoe-btn {
    cursor: pointer;
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(200px, 30px);
  }

  &__close-wrapper {
    cursor: pointer;

    width: 100%;
    height: 100%;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    margin-top: 30px;
  }

  &__item > a {
    cursor: pointer;

    display: flex;

    .P {
      margin-left: 20px;
    }

    & > svg {
      min-width: 22px;
    }

    & > svg > g > path {
      fill: var(--accent-color-primary);
    }
  }
}
</style>
