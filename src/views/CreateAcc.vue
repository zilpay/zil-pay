<template>
  <div>
    <BackBar/>

    <main class="restore">
      <label>Your mnemonic Seed Phrase.
        <img src="/icons/refresh.svg" height="15"
             class="update-seed">
      </label>
      <textarea class="mnemonic" cols="30"></textarea>

      <div class="input-group">
         <div class="text-left">
          <label>Password (min 6 chars)</label>
          <input type="password">
        </div>
        <div class="text-left">
          <label>Confirm Password</label>
          <input type="password">
        </div>

        <button>Create</button>
      </div>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'

export default {
  name: 'CreateAcc',
  components: { BackBar },
  data() {
    return {
      seed: 'sdasgh own rail mimic dsad amazing das maze dasd smile leader deposit'
    };
  }
}
</script>

<style lang="scss">
.mnemonic {
  margin: 0px; height: 216px; width: 403px;
}
.update-seed {
  cursor: pointer;
}
</style>
