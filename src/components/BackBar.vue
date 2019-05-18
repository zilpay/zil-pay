<template>
  <div class="nav-container">
    <nav>
      <img src="/icons/back.svg" height="40"
           class="back"
           @click="$router.go(-1)">

      <span class="route-name text-black">
        {{$router.currentRoute.name}}
      </span>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'BackBar'
}
</script>

<style lang="scss">
.back {
  margin: 10px;
  cursor: pointer;
}
.route-name {
  margin: 10px;
  font-weight: 500;
}
</style>