<template>
  <div>
     <BackBar/>
     <main class="tab-bar">
      <div class="tab-item"
           @click="$router.push('/setting/general')">
        <div class="title">General</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Currency conversion, primary currency</p>
        </div>
      </div>

      <div class="tab-item"
           @click="$router.push('/setting/networks')">
        <div class="title">Networks</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Add and edit custom RPC networks</p>
        </div>
      </div>

      <div class="tab-item">
        <div class="title">Advanced</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>custom gas price and gas limit</p>
        </div>
       </div>

      <div class="tab-item">
        <div class="title">Security & Privacy</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Privacy settings and wallet seed phrase</p>
        </div>
      </div>

      <div class="tab-item">
        <div class="title">About</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Version, support center, and contact info.</p>
        </div>
      </div>
     </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'

export default {
  name: 'Setting',
  components: { BackBar }
}
</script>

<style lang="scss">
.tab-bar {
  margin: 10px;
  // overflow: auto;
}
.tab-item {
  cursor: pointer;
}
.tab-item {
  padding: 10px;

  display: grid;
  grid-template-columns: 90% 1fr 1fr;

  border-top: 1px solid rgb(179, 179, 179);
  width: 100%;

  img {
    opacity: 0.5;
    margin-top: 50px;
  }
  div.title {
    font-weight: 600;
  }
}
.tab-content {
  p {font-size: 15px;}
}

</style>