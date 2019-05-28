<template>
  <div>
    <main class="is-mini">
      <div class="dapp text-center">
        <img src="https://kovan.dragoneth.com/favicon.ico">
        <div class="title">DragonETH</div>
        <label>kovan.dragoneth.com</label>
      </div>

      <p class="text-center">This site is requesting access
         to view your current account address.
      </p>

      <div class="btns-access">
        <button class="btn-outline">Cancel</button>
        <button>connect</button>
      </div>
      
    </main>
  </div>
</template>

<script>
export default {
  name: 'Connect'
}
</script>

<style lang="scss">
.dapp {
  margin-top: 30px;
  display: grid;
  justify-items: center;
  
  .title {
    margin-top: 5px;
    font-weight: 600;
  }
}

main > p {
  font-size: 15px;
  width: 50%;
  justify-self: center;
}
.btns-access {
  margin-top: 30%;
  justify-self: center;
  padding: 10px;

  button {
    margin: 10px;
  }
}
</style>
