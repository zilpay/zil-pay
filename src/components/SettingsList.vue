<template>
  <div :class="b()">
    <Title :size="SIZE_VARIANS.md">
      {{ local.SETTINGS }}
    </Title>
    <ul :class="b('wrapper')">
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
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'

import Title from '@/components/Title'
import P from '@/components/P'
import SvgInject from '@/components/SvgInject'

import General from '@/pages/settings/General'
import Advanced from '@/pages/settings/Advanced'
import Networks from '@/pages/settings/Networks'
import Connections from '@/pages/settings/Connections'
import Security from '@/pages/settings/Security'
import About from '@/pages/settings/About'

const LINK_LIST = [
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

      LINK_LIST
    }
  },
  computed: {
    ...mapState(uiStore.STORE_NAME, [
      uiStore.STATE_NAMES.local
    ])
  }
}
</script>

<style lang="scss">
.SettingsList {
  padding: 20px;

  &__wrapper {
    display: grid;
    grid-gap: 25px;

    margin: 0;
    padding: 0;
    margin-top: 30px;
    width: min-content;
  }

  &__item {
    width: min-content;
    list-style: none;

    a {
      display: flex;
      align-items: center;

      .P {
        margin-left: 25px;
      }
    }
  }
}
</style>
