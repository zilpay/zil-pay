<template>
  <div :class="b()">
    <TopBar />
    <div :class="b('wrapper')">
      <RadioGroup
        title="Currency conversion"
        :elements="elements"
      />
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'
import RadioGroup from '@/components/RadioGroup'

export default {
  name: 'General',
  components: {
    TopBar,
    RadioGroup
  },
  data() {
    return {
      radio: false,
      elements: [
        'USD',
        'BTC'
      ]
    }
  }
}
</script>

<style lang="scss">

</style>
