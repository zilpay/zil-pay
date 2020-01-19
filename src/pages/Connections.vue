<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <Button
        :color="COLOR_VARIANTS.warning"
        round
        block
      >
        Clear
      </Button>
    </Container>
    <div
      v-for="(item, index) of CONNECTED_LIST"
      :key="index"
      :class="b('list')"
    >
      <Item
        :src="item.icon"
        trash
        pointer
      >
        <P :size="SIZE_VARIANS.xs">
          {{ item.domain }}
        </P>
        <P :size="SIZE_VARIANS.xs">
          {{ item.title }}
        </P>
      </Item>
      <Separator v-show="index < CONNECTED_LIST.length - 1"/>
    </div>
  </div>
</template>

<script>
/* eslint-disable max-len */
import {
  SIZE_VARIANS,
  COLOR_VARIANTS,
  ICON_TYPE
} from '@/config'

import TopBar from '@/components/TopBar'
import Button from '@/components/Button'
import Container from '@/components/Container'
import Separator from '@/components/Separator'
import P from '@/components/P'

import Item from '@/components/Item'

const CONNECTED_LIST = [
  {
    domain: 'zilpay.github.io',
    icon: 'https://media.dappreview.cn/images/DR-Jason/YCrSFKRbBZHJnDmNrMNE4c4DBBMSCKYp.png?x-oss-process=style/dapp-logo',
    title: 'Blockchain domains'
  },
  {
    domain: 'zilpay.github.io',
    icon: 'https://dappreview.oss-cn-hangzhou.aliyuncs.com/dappLogo/10404/tronvegasonline/YkfjbCn2WfMJCjPwhT8ECAnFCW6T2bxK.png?x-oss-process=style/dapp-logo',
    title: 'Scilla IDE.'
  }
]

export default {
  name: 'Connections',
  components: {
    TopBar,
    Button,
    Container,
    Item,
    P,
    Separator
  },
  data() {
    return {
      SIZE_VARIANS,
      COLOR_VARIANTS,
      CONNECTED_LIST,
      ICON_TYPE
    }
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 60px;
  }
}
</style>
