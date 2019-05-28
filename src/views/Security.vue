<template>
  <div>
    <BackBar/>

    <main class="is-mini">
      <div class="form">
        <h5>Privacy Data</h5>
        <div class="dis">Clear all allowed accesses to dApp.</div>
        <button @click="clearData">Clear data</button>
      </div>

      <div class="form">
        <h5>Reveal Seed Words</h5>
        <label>Do not share this data with anyone.</label>
        <button @click="ExportSeed">Reveal Seed Words</button>
      </div>

      <div class="form">
        <h5>Restore new mnemonic Seed Phrase</h5>
        <button @click="restore">restore</button>
      </div>
    </main>
  </div>
</template>

<script>
const BackBar = () => import('../components/BackBar');


export default {
  name: 'Security',
  components: { BackBar },
  methods: {
    restore() {
      this.$router.push({name: 'Restore'});
    },
    ExportSeed() {
      this.$router.push({
        name: 'Export',
        params: {type: 'seed'}
      });
    },
    clearData() {
      console.log('clear dapp data');
    }
  }
}
</script>

<style lang="scss">

.form {
  margin-left: 30px;
  display: grid;
  grid-template-columns: 1fr;

  button {
    justify-self: left;
  }
}
.dis {
  font-size: 15px;
  margin: 10px;
}
</style>