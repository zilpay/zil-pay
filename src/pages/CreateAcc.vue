<template>
  <div :class="b()">
    <!-- <div :class="b('wrapper')">
      <Container :class="b('nav-bar')">
        <Icon
          :icon="ICON_VARIANTS.arrowLefrt"
          width="13"
          height="23"
          pointer
        />
      </Container>
    </div> -->
    dsadas
  </div>
</template>

<script>
import { ICON_VARIANTS } from '@/config'

// import Icon from '@/components/Icon'

export default {
  name: 'CreateAcc',
  components: {
    // Icon
  },
  data() {
    return {
      ICON_VARIANTS
    }
  }
}
</script>

<style lang="scss">

</style>
