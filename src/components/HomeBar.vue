<template>
  <div class="nav-container">
    <nav>
      <div class="left">
        <img src="/icons/qr-code.svg" height="30">
        <img src="/icons/expand.svg" height="30">
      </div>

      <div class="center text-black">
        ZilPay
      </div>

      <div class="right">
        <img src="/icons/locked.svg" height="30">
        <img src="/icons/refresh.svg" height="30">
        <img src="/icons/settings.svg" height="30"
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

</style>