<template>
  <div>
    <BackBar/>

    <main class="restore">
      <h4>Restore by mnemonic Seed Phrase</h4>
      <div>
        <label>Enter your secret mnemonic word phrase here.</label>
        <br>
        <textarea class="seed" cols="30" v-model="seed"></textarea>
      </div>

      <div class="input-group">
         <div class="text-left">
          <label>Password (min 6 chars)</label>
          <input type="number">
        </div>
        <div class="text-left">
          <label>Confirm Password</label>
          <input type="number">
        </div>

        <button>Restore</button>
      </div>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'

export default {
  name: 'Restore',
  components: { BackBar },
  data() {
    return {
      seed: 'sdasgh own rail mimic dsad amazing das maze dasd smile leader deposit'
    };
  }
}
</script>

<style lang="scss">
.seed {
  justify-self: center;
}
.input-group > button {
  margin-top: 30px;
  width: 100%;
}
.restore {
  justify-content: center;
  justify-items: center;
}
</style>
