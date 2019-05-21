<template>
  <div>
    <BackBar/>

    <main>
      <div class="form-border change-gas">
        <div>
          <label for="gasPrice">Gas Price (Li)</label>
          <input type="number" id="gasPrice" value="1000">
        </div>
        <div>
          <label for="gasLimit">Gas Limit</label>
          <input type="number" id="gasLimit" value="1">
        </div>
      </div>

      <button>default</button>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'


export default {
  name: 'Advanced',
  components: { BackBar }
}
</script>

<style lang="scss">

.change-gas {
  margin: 30px;
  padding: 30px;
  margin-top: 30px;
}
</style>