<template>
  <Container :class="b()">
    <div :class="b('wrapper')">
      <Icon
        :icon="icons.zilPayLogo"
        width="148"
        height="148"
      />
      <Title>
        Welcome to ZilPay
      </Title>
      <P>
        Connecting you to Zilliqa and
        the Decentralized Web. We’re happy to see you.
      </P>
      <Button
        :size="sizes.xs"
        block
        round
        @click="goToCreate"
      >
        Get Started
      </Button>
    </div>
  </Container>
</template>

<script>
import { ICON_VARIANTS, SIZE_VARIANS } from '@/config'
import Icon from '@/components/Icon'
import Title from '@/components/Title'
import P from '@/components/P'
import Button from '@/components/Button'
import Container from '@/components/Container'
import CreateAcc from '@/pages/CreateAcc'

export default {
  name: 'FirstStart',
  components: {
    Icon,
    Title,
    P,
    Button,
    Container
  },
  data() {
    return {
      // Proxy constants:
      icons: ICON_VARIANTS,
      sizes: SIZE_VARIANS
    }
  },
  methods: {
    goToCreate() {
      this.$router.push({
        name: CreateAcc.name
      })
    }
  }
}
</script>

<style lang="scss">
.FirstStart {
  display: grid;

  justify-content: center;
  align-items: center;

  height: 100vh;

  &__wrapper {
    display: grid;
    grid-gap: 30px;

    justify-items: center;
    text-align: center;

    max-width: 600px;
  }
}
</style>
