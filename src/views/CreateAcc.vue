<template>
  <div>
    <BackBar/>

    <main class="restore">
      <textarea cols="30"></textarea>

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

</style>
