# ZilPay Browser Extension

[![Chrome](https://img.shields.io/chrome-web-store/v/klnaejjgbibmhlephnhpmaofohgkpgkd)](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
[![FireFox](https://img.shields.io/amo/v/zilpay)](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Zilliqa/scilla/blob/master/LICENSE)
[![Gitter chat](http://img.shields.io/badge/chat-on%20gitter-077a8f.svg)](https://gitter.im/Zilliqa/General)

*Read this in other languages: [简体中文](README_ZH-CN.md), [Español](README_ES.md), [Nederlands](intro_NL.md), [Русский](README_RU.md), [日本語](README_JP.md), [Deutsch](README_DE.md), [Korean](README_KR.md).*

ZilPay is a browser wallet for Zilliqa blockchain. Developers can integrate ZilPay into their website to create Decentralised Apps.

<p align="center">
  <a href="https://zilpay.xyz"><img src="https://github.com/lich666dead/zil-pay/blob/master/imgs/preview.png"></a>
</p>

## Links
+ [Discord](https://discordapp.com/channels/370992535725932544/636917110089580544)
+ [Chrome store](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
+ [FireFox store](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
+ [Opera](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)

## Getting Started
You can deploy the local version, from source code.

For dApp developers:
+ [ZilPay full documentation](https://zilpay.xyz/Documentation/)
+ [ZilPay try build your dApp](https://medium.com/coinmonks/test-and-develop-dapps-on-zilliqa-with-zilpay-52b165f118bf?source=friends_link&sk=2a60070ddac60677ec36b1234c60222a)
+ [Zilliqa dApps example](https://github.com/lich666dead/zilliqa-dApps)

### Installing

```bash
$ npm install         # install dependencies
```

### Building

* For develop
```bash
$ npm run content     # build content.js
$ npm run inpage      # build inpage.js
$ npm run background  # build background.js
$ npm run scripts     # build content.js & inpage.js & background.js
$ npm run all:firefox # all scripts build for firefox platform.
$ npm run all:chrome  # all scripts build for chrome platform.
```

* For production:
```bash
$ npm run build:prod:firefox
$ npm run build:prod:chrome
```

### Running the tests
```bash
$ npm run test # run testing
```

## Built With

* [webpack](https://github.com/webpack/webpack)
* [babel](https://github.com/babel/babel)
* [vuejs](https://github.com/vuejs)

## Authors

* **Rinat Khasanshin** - *Initial work* - [lich666black](https://github.com/lich666dead)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/zilpay/zil-pay/blob/master/LICENSE) file for details.

Thanks for yours donate.
------

- ZIL: zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace
- ETH: 0x246C5881E3F109B2aF170F5C773EF969d3da581B
- BTC: 12MRR8LyLVLHVqXcjz46c9o3KBS76fAY9r
- ZEC: t1dZMw8FVWnGKC9cyXKaiKWmmAFmQoeNc5Y
- LTC: LM3JwjTbboMkHdFEYnn4ycJB61r3fqvXPr
- DASH: Xv2tpCMHPAztd4B5UMnaqwkqnSfiUs1P8B
