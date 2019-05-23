<template>
  <div>
    <BackBar/>

    <main class="export">
      <div class="header">
        <label>Your mnemonic word phrase.</label>
        <br>
        <textarea class="seed" cols="30"></textarea>
      </div>

      <div class="input-group">
         <div class="text-left">
          <label>Password</label>
          <input type="password">
        </div>
        <button>Export</button>
      </div>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'

export default {
  name: 'Export',
  components: { BackBar }
}
</script>

<style lang="scss">
.export {
  justify-items: center;

  & > .input-group > button {
    margin-top: 40px;
    width: 100%;
  }
}
</style>