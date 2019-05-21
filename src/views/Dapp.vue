<template>
  <div>
    <BackBar/>
    <main>

      <div class="dapp-item">
        <img src="https://www.gameabc.io/favicon.ico">
        <div>Game ABC</div>
      </div>
    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'

export default {
  name: 'Dapp',
  components: { BackBar }
}
</script>
