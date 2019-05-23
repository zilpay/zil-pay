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
const BackBar = () => import('../components/BackBar');

export default {
  name: 'Dapp',
  components: { BackBar }
}
</script>
