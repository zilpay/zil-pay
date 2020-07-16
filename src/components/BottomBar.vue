<template>
  <div :class="b()">
    <div :class="b('wrapper')">
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
  display: flex;
  justify-content: center;

  &__wrapper {
    position: absolute;
    bottom: 0;

    display: flex;
    justify-content: space-around;
    align-items: center;

    width: 100%;
    height: 40px;
    max-width: 400px;

    border-top-left-radius: 15px;
    border-top-right-radius: 15px;

    background-color: var(--opacity-bg-element-1);
  }

  &__icon {
    cursor: pointer;

    &_enable > svg > path {
      fill: var(--accent-color-primary);
    }
  }
}
</style>
