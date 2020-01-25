<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <div
        v-for="(item, index) of ITEMS"
        :key="index"
        @click="$router.push({ name: item })"
      >
        <Item
          arrow
          pointer
        >
          <P :font="FONT_VARIANTS.medium">
            {{ item }}
          </P>
        </Item>
        <Separator v-show="index < ITEMS.length - 1"/>
      </div>
    </Container>
  </div>
</template>

<script>
import { FONT_VARIANTS } from '@/config'

import General from '@/pages/settings/General'
import Advanced from '@/pages/settings/Advanced'
import Networks from '@/pages/settings/Networks'
import Security from '@/pages/settings/Security'
import About from '@/pages/settings/About'

import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import Item from '@/components/Item'
import Separator from '@/components/Separator'
import P from '@/components/P'

const ITEMS = [
  General.name,
  Advanced.name,
  Networks.name,
  Security.name,
  About.name
]

export default {
  name: 'Settings',
  components: {
    TopBar,
    Container,
    Item,
    Separator,
    P
  },
  data() {
    return {
      ITEMS,
      FONT_VARIANTS
    }
  }
}
</script>

<style lang="scss">

</style>
