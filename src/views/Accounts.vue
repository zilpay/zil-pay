<template>
  <div>
    <BackBar/>

    <main>
      <div class="top-bar text-black">
        <span>Create Account</span>
        <span>Restore Account</span>
      </div>

      <div class="cards">
        <div class="card text-white">
          <div class="header">
            <div>warden</div>
            <img src="/icons/selected.svg" height="25">
          </div>
          <div class="body">
            <div>1000 <span>ZIL</span></div>
            <div>≈ 30 <span>USD</span></div>
          </div>
          <div class="footer">
            <div>{{account.address}}</div>
            <img src="/icons/copy.svg" height="17">
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import  BackBar from '../components/BackBar'


export default {
  name: 'Accounts',
  components: { BackBar },
  data() {
    return {
      account: {
        address: '0x90C3269c32e328fC26C91Fb3cD107B88E74e1C7c',
        balance: '312.3',
        name: 'warden'
      },
    };
  }
}
</script>
