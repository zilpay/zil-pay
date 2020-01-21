<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <Radio>test</Radio>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'
import Radio from '@/components/Radio'

export default {
  name: 'General',
  components: {
    TopBar,
    Radio
  }
}
</script>

<style lang="scss">

</style>
