<template>
  <div :class="b()">
    <router-link
      :class="b('icon', { enable: (currentName === LINKS.home) })"
      :to="{ name: LINKS.home }"
    >
      <SvgInject :variant="ICON_VARIANTS.home" />
    </router-link>
    <router-link
      :class="b('icon', { enable: (currentName === LINKS.tokens) })"
      :to="{ name: LINKS.tokens }"
    >
      <SvgInject :variant="ICON_VARIANTS.chip" />
    </router-link>
    <router-link
      :class="b('icon', { enable: (currentName === LINKS.contacts) })"
      :to="{ name: LINKS.contacts }"
    >
      <SvgInject :variant="ICON_VARIANTS.contact" />
    </router-link>
  </div>
</template>

<script>
import { ICON_VARIANTS } from '@/config'

import Home from '@/pages/Home'
import Contacts from '@/pages/Contacts'
import Tokens from '@/pages/Tokens'

import SvgInject from '@/components/SvgInject'

export default {
  name: 'BottomBar',
  components: {
    SvgInject
  },
  data() {
    return {
      ICON_VARIANTS,

      LINKS: {
        home: Home.name,
        tokens: Tokens.name,
        contacts: Contacts.name
      }
    }
  },
  computed: {
    currentName() {
      return this.$router.history.current.name
    }
  }
}
</script>

<style lang="scss">
.BottomBar {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 15px 10px 0;
  width: 100%;

  &__icon {
    cursor: pointer;

    &_enable > svg > path {
      fill: var(--accent-color-primary);
    }
  }
}
</style>
