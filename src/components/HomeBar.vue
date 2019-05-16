<template>
  <div class="nav-container">
    <nav>
      <div class="left text-white">
        ZilPay
      </div>

      <div class="center">
        
      </div>

      <div class="right">
        <img src="/icons/locked.svg" height="30">
        <img src="/icons/refresh.svg" height="30">
        <img src="/icons/settings.svg" height="30">
      </div>

    </nav>
  </div>
</template>

<script>
export default {
  name: 'HomeBar'
}
</script>

<style lang="scss">
.left {
  padding: 5%;
  font-size: 25px;
  font-weight: bold;
}
.right > img {
  margin-top: 24px;
  padding: 1%;
}
</style>