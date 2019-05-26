<template>
  <div class="nav-container">
    <nav>
      <div class="left">
        <img src="/icons/qr-code.svg" height="30"
             class="point"
             @click="$router.push({name: 'Receive'})">
        <img src="/icons/expand.svg" height="30" class="point">
        <img src="/icons/networking.svg" height="30"
             class="point"
             @click="$router.push({name: 'DAPP'})">
      </div>

      <div class="center text-black">
        ZilPay
      </div>

      <div class="right">
        <img src="/icons/locked.svg" height="30"
             class="point"
             @click="$router.push({name: 'Lock'})">
        <img src="/icons/refresh.svg" height="30" class="point">
        <img src="/icons/settings.svg" height="30"
             class="point"
             @click="$router.push({name: 'Setting'})">
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
@import "../styles/dimensions";

nav > .center {
  font-size: 25px;
  font-weight: bold;
}
.right > *, .left > * {
  margin-top: 24px;
  padding: 2%;
  cursor: pointer;
  
  &:hover {
    transition: all ease 0.3s;
  }
}
@media screen and (max-width: $nav-max-width) {
  .right > img {
    height: 25px;
  }
  .left > img {
    height: 25px;
  }
}
</style>