<template>
  <div :class="b()">
    <div
      v-for="(_, index) of Array(3)"
      :key="index"
    />
  </div>
</template>

<script>
export default {
  name: 'Burger'
}
</script>

<style lang="scss">

</style>
