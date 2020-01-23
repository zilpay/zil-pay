<template>
  <div :class="b()">
    <TopBar />
    <Container :class="b('wrapper')">
      <RadioGroup
        v-model="radioGroup.index"
        :title="radioGroup.title"
        :elements="radioGroup.elements"
      >
        {{ radioGroup.title }}
      </RadioGroup>
    </Container>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar'
import Container from '@/components/Container'
import RadioGroup from '@/components/RadioGroup'

export default {
  name: 'General',
  components: {
    TopBar,
    RadioGroup,
    Container
  },
  data() {
    return {
      radio: false,
      radioGroup: {
        title: 'Currency conversion:',
        elements: [
          'USD',
          'BTC'
        ],
        index: 0
      }
    }
  }
}
</script>

<style lang="scss">
.General {
  &__wrapper {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>
