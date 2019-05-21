<template>
  <div>
    <BackBar/>

    <main>
      <div class="form">
        <h5>Privacy Data</h5>
        <div class="dis">Clear all allowed accesses to dApp.</div>
        <button>Clear data</button>
      </div>

      <div class="form">
        <h5>Reveal Seed Words</h5>
        <button>Reveal Seed Words</button>
      </div>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'


export default {
  name: 'Security',
  components: { BackBar }
}
</script>

<style lang="scss">

.form {
  margin-top: 30px;
  display: grid;
  grid-template-columns: 1fr;
}
.dis {
  font-size: 15px;
  margin: 10px;
}
</style>