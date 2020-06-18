<template>
  <div :class="b()">
    <div :class="b('wrapper')">
      <i :class="b('icon', { enable: (currentName === LINKS.home) })">
        <SvgInject :variant="ICON_VARIANTS.home" />
      </i>
      <i :class="b('icon')">
        <SvgInject :variant="ICON_VARIANTS.chip" />
      </i>
      <i :class="b('icon', { enable: (currentName === LINKS.contacts) })">
        <SvgInject :variant="ICON_VARIANTS.contact" />
      </i>
    </div>
  </div>
</template>

<script>
import { ICON_VARIANTS } from '@/config'

import Home from '@/pages/Home'
import Accounts from '@/pages/Accounts'

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
        contacts: Accounts.name
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
