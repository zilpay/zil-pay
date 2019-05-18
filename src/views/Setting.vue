<template>
  <div class="optionsWrap">
    <div class="option">
      <div class="txt">
        <div class="span">
          <span>Switch node</span>
          <div class="unit">Shasta Testnet</div>
        </div>
        <div class="settingWrap" style="height: 0px;">
          <div class="nodeWrap">
            <div class="nodeItem">
              <div class="title">Mainnet</div>
              <div class="cell">
                <span>Full node</span>
                <span>https://api.trongrid.io</span>
              </div>
              <div class="cell">
                <span>Solidity node</span>
                <span>https://api.trongrid.io</span>
              </div>
              <div class="cell">
                <span>Event server</span>
                <span>https://api.trongrid.io</span>
              </div>
            </div>
            <div class="nodeItem selected">
              <div class="title">Shasta Testnet</div>
              <div class="cell">
                <span>Full node</span>
                <span>https://api.shasta.trongrid.io</span>
              </div>
              <div class="cell">
                <span>Solidity node</span>
                <span>https://api.shasta.trongrid.io</span>
                </div>
              <div class="cell">
                <span>Event server</span>
                <span>https://api.shasta.trongrid.io</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Setting'
}
</script>
