<template>
  <div :class="b()">
    <TopBar close/>
    <Container :class="b('wrapper')">
      <DoubleRange />
    </Container>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'
import DoubleRange from '@/components/DoubleRange'
import Container from '@/components/Container'

export default {
  name: 'Advanced',
  components: {
    TopBar,
    DoubleRange,
    Container
  }
}
</script>

<style lang="scss">

</style>
