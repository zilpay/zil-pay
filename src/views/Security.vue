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

      <div class="form">
        <h5>Restore your wallet to first form</h5>
        <button @click="resetWalelt">Reset wallet</button>
      </div>
      
      <br>
    </main>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const BackBar = () => import('../components/BackBar');


export default {
  name: 'Security',
  components: { BackBar },
  methods: {
    ...mapActions('Static', [
      'clearDappList'
    ]),
    ...mapActions('Wallet', [
      'walletReset'
    ]),

    restore() {
      this.$router.push({ name: 'Restore' });
    },
    ExportSeed() {
      this.$router.push({
        name: 'Export',
        params: {type: 'seed'}
      });
    },
    async clearData() {
      await this.clearDappList();
      this.$router.push({ name: 'Home' });
    },
    resetWalelt() {
      this.walletReset();
      this.$router.push({ name: 'Home' });
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