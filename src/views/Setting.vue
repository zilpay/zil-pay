<template>
  <div>
     <BackBar/>
     <main class="tab-bar">
      <div class="tab-item"
           @click="$router.push({name: 'General'})">
        <div class="title">General</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Currency conversion</p>
        </div>
      </div>

      <div class="tab-item"
           @click="$router.push({name: 'Networks'})">
        <div class="title">Networks</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Change and edit custom RPC networks</p>
        </div>
      </div>

      <div class="tab-item"
           @click="$router.push({name: 'Advanced'})">
        <div class="title">Advanced</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>custom gas price and gas limit</p>
        </div>
       </div>

      <div class="tab-item"
           @click="$router.push({name: 'Security'})">
        <div class="title">Security & Privacy</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Privacy settings and wallet seed phrase</p>
        </div>
      </div>

      <div class="tab-item"
           @click="$router.push({name: 'About'})">
        <div class="title">About</div>
        <img src="/icons/caret-right.svg" height="40">
        <br>
        <div class="tab-content">
          <p>Version, contact info.</p>
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