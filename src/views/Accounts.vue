<template>
  <div>
    <BackBar/>

    <main>
      <div class="top-bar text-black">
        <span>Create Account</span>
        <span>Restore Account</span>
      </div>

    </main>
  </div>
</template>

<script>
import  BackBar from '../components/BackBar'


export default {
  name: 'Accounts',
  components: { BackBar }
}
</script>

<style lang="scss">
.top-bar {
  padding: 1px;
  height: 100%;
  width: 360px;
  background-color: rgba(0, 0, 0, 0.144);
  border-radius: 5px;
  text-align: center;

  * {
    padding: 5px;
    cursor: pointer;
    font-size: 15px;
  }

  span:nth-child(1) {
    border-right: 1px solid #fff;
  }
}
</style>
