<template>
  <div :class="b()"></div>
</template>

<script>
export default {
  name: 'AddMenu'
}
</script>

<style lang="scss">
.Add {
  right: 15px;
  z-index: 1;
  width: 45px;
  bottom: 15px;
  height: 45px;
  display: block;
  position: absolute;
  line-height: 45px;
  border-radius: 50%;
}
</style>
