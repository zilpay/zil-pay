<template>
  <div class="container">
    <div class="row justify-content-center">
      <button v-btn="'ightindigo m-2'"
              @click="$router.go(-1)">BACK</button>
      <h1 class="text-ightindigo display-4">{{currentPage}}</h1>
    </div>
  </div>
</template>

<script>
import btn from '../directives/btn'


export default {
  name: 'Settings',
  directives: { btn },
  mounted() {
  },
  computed: {
    currentPage() {
      return this.$router.history.current.name;
    }
  }
}
</script>

<style lang="scss">

</style>
