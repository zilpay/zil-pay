<template>
  <div :class="b()">
    <Container :class="b('wrapper')">
      <Title>
        Restore your Account.
      </Title>
      <P>
        Enter your secret word phrase here to restore your vault.
      </P>

    </Container>
  </div>
</template>

<script>
import Title from '@/components/Title'
import P from '@/components/P'
// import Button from '@/components/Button'
import Container from '@/components/Container'

export default {
  name: 'Restore',
  components: {
    Title,
    P,
    Container
  }
}
</script>

<style lang="scss">

</style>
