<template>
  <div>
    <BackBar/>
    
    <main>
      <div class="form-border change-gas">
        <div>
          <label for="gasPrice">Gas Price (Li)</label>
          <input type="number" id="gasPrice" v-model="gasPrice">
        </div>
        <div>
          <label for="gasLimit">Gas Limit</label>
          <input type="number" id="gasLimit" v-model="gasLimit">
        </div>

        <small>fee: {{fee}}</small>
      </div>

      <button class="def"
              @click="toDefaultGas">default</button>
    </main>
  </div>
</template>

<script>
import GasFee from '../mixins/gas-fee'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Advanced',
  components: { BackBar },
  mixins: [GasFee],
  mounted() {
    this.gasMutate = true;
  }
}
</script>

<style lang="scss">

.change-gas {
  margin: 30px;
  padding: 30px;
  margin-top: 30px;
}
</style>