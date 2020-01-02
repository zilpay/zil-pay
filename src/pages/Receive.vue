<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <Alert>
        <Title :size="SIZE_VARIANS.sm">
          Deposit ZIL.
        </Title>
        <P
          :class="b('deposit-info')"
          :font="FONT_VARIANTS.regular"
        >
          To interact with decentralized applications using ZilPay, you’ll need ZIL coin in your wallet.
        </P>
      </Alert>
    </div>
  </div>
</template>

<script>
import { SIZE_VARIANS, FONT_VARIANTS } from '@/config'

import TopBar from '@/components/TopBar'
import Alert from '@/components/Alert'
import Title from '@/components/Title'
import P from '@/components/P'

export default {
  name: 'Receive',
  components: {
    TopBar,
    Alert,
    Title,
    P
  },
  data() {
    return {
      SIZE_VARIANS,
      FONT_VARIANTS
    }
  }
}
</script>

<style lang="scss">
.Receive {
  &__wrapper {
    display: grid;
  }

  &__deposit-info {
    font-size: 13px;
    line-height: 15px;

    letter-spacing: -0.139803px;
  }
}
</style>
