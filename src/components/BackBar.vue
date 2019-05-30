<template>
  <div class="nav-container">
    <nav class="back-bar">
      <img src="/icons/back.svg" height="40"
           class="back"
           @click="$router.go(-1)">

      <span class="route-name text-black">
        {{$router.currentRoute.name}}
      </span>

      <img class="close" height="30"
           src="/icons/close-button.svg"
           v-show="isCloseIcon"
           @click="$router.push({name: 'Home'})">
    </nav>
  </div>
</template>

<script>
export default {
  name: 'BackBar',
  computed: {
    isCloseIcon() {
      const { path } = this.$router.currentRoute;
      const count = path.split('/').length;

      if (count > 2) {
        return true;
      }

      return false;
    }
  }
}
</script>

<style lang="scss">
.back, .close {
  margin: 10px;
  cursor: pointer;
}
.route-name {
  margin: 10px;
  font-weight: 500;
}
.back-bar {
  justify-items: center;
}
</style>