/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
const { document, window } = global

// this method was copied from zillet wallet "https://zillet.io";
const printMnemonic = phrase => {
  return `<html id="print-wallet">
  <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700" rel="stylesheet">
  <div class="print-container" style="margin-bottom: 50px;" id="print-container" onload="myFunction()">
      <div class="print-text">
          <p>
          Please
          <strong>DO NOT FORGET</strong> to save your mnemonic Seed Phrase. You will need your
          <strong>Mnemonic Seed Phrase</strong> to restore your wallet.
          </p>
          <h3 style="letter-spacing: 0.02rem;"> Your Mnemonic seed</h3>
          <div class="phrase">
            ${phrase}
          </div>
          <p>
              <b>Do not lose it!</b> It cannot be recovered if you lose it.
          </p>
          <p>
            <b>Do not share it!</b> Your funds will be stolen if you use this file on a phishing site.
          </p>
          <p>
            <b>Make a backup!</b> Secure it like the millions of dollars it may one day be worth.
          </p>
          <div class="footer">
            <a href="https://zilpay.xyz/">ZilPay</a href="">
          </div>
      </div>
  </div>
  <style>
  pre{
      margin: 0 auto 0;
      text-align:center;
  }
  .print-container {
    text-align: center;
      font-family: 'Source Sans Pro', sans-serif;
      -webkit-font-smoothing: antialiased;
      width: 900px;
      border: 1px solid gray;
      display: flex;
      margin-bottom: 50px;
      position: relative;
      color: #2d3748;
  }
  .hidden{
      visiblity:hidden;
      height: 0;
      width:0;
      margin:0;
  }
  .print-text{
      width: 100%;
      margin: auto;
      position: relative;
      padding: 20px;
      overflow: hidden;
  }
  p, strong{
      word-break: break-word;
  }
  img{
      max-width: 150px;
  }
  .phrase{
    font-family: Menlo,Monaco,Consolas,Courier New,monospace!important;
    font-weight: 500!important;
    flex: 1 1 0%;
    max-width: 500px;
    margin: auto;
    position: relative;
    padding: .75rem 1rem;
    margin-bottom: 2rem;
    border-radius: .25rem;
    border:  1px solid gray;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    line-height: 1.5;
  }
  a{
    color: rgba(#2d3748, 0.3);
    font-size: 0.8rem;
    text-decoration: none;
    text-align: center;
  }
  </style>
<html>
`
}

export default {
  methods: {
    printSeed() {
      if (!this.words) {
        throw new Error('properties word is', typeof this.words)
      }

      const paperWallet = printMnemonic(this.words)
      const paperBody = document.createElement('BODY')

      paperBody.innerHTML = paperWallet

      const win = window.open('about:blank', '_blank')

      win.document.body = paperBody

      setTimeout(() => {
        win.print()
      }, 500)
    }
  }
}
