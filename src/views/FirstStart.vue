<template>
  <div>
    <main class="first-page">
      <img src="/icon128.png">
      <h2 class="text-black">ZilPay</h2>
      
      <div class="panels">
        <div class="form-border">
          <img src="/icons/download.svg" height="90">
          <h5>I have mnemonic word phrase.</h5>
          <button @click="$router.push({name: 'Restore'})">Restore</button>
        </div>
        <div class="form-border">
          <img src="/icons/plus.svg" height="90">
          <h5>let's create new Account.</h5>
          <button>Create</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'FirstStart'
}
</script>

<style lang="scss">
@import "../styles/dimensions";

.first-page {
  margin: 50px;
  justify-items: center;
}
.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;

  div {
    padding: 10px;
    display: grid;
    justify-items: center;
  }
}
@media screen and (max-width: $nav-max-width) {
  .panels {
    grid-template-columns: 1fr;
  }
}

</style>
