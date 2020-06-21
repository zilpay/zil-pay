<template>
  <div :class="b()">
    <router-link
      :class="b('link')"
      :to="LINKS.home"
    >
      <P>
        {{ local.CONGRATULATION_LINK }}
      </P>
    </router-link>
    <SvgInject
      :class="b('logo')"
      :variant="ICON_VARIANTS.zilPayLogo"
    />
    <div :class="b('wrapper')">
      <div>
        <Title :size="SIZE_VARIANS.lg">
          {{ local.CONGRATULATION_TITLE }}
        </Title>
        <P :size="SIZE_VARIANS.md">
          {{ local.CONGRATULATION_DESCRIPTION }}
        </P>
      </div>
      <div :class="b('list')">
        <Title
          :variant="COLOR_VARIANTS.primary"
          :size="SIZE_VARIANS.sm"
        >
          {{ local.CONGRATULATION_SUBTITLE }}
        </Title>
        <ul>
          <li
            v-for="(item, index) of local.CONGRATULATION_LIST"
            :key="index"
          >
            <P>
              {{ item }}
            </P>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import uiStore from '@/store/ui'

import { SIZE_VARIANS, COLOR_VARIANTS, ICON_VARIANTS } from '@/config'

import Home from '@/pages/Home'

import SvgInject from '@/components/SvgInject'
import Title from '@/components/Title'
import P from '@/components/P'

export default {
  name: 'Congratulation',
  components: {
    SvgInject,
    Title,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      ICON_VARIANTS,

      LINKS: {
        home: Home.name
      }
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
.Congratulation {
  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;

  background-color: var(--app-background-color);

  &__logo {
    position: absolute;

    width: 50vw;
    height: 50vh;
  }

  &__link {
    position: absolute;
    right: 30px;
    top: 30px;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    max-width: 660px;
    min-height: 50vh;

    margin-bottom: 32vh;

    z-index: 1;

    @media (max-width: 494px) {
      margin-bottom: 0;
    }
  }

  &__list {
    padding: 20px;
    text-align: left;

    background: var(--opacity-bg-element);
    border: 2px solid var(--accent-color-primary);
    border-radius: var(--default-border-radius);
    color: var(--theme-color-font);
  }
}
</style>
