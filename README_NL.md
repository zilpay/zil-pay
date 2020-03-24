# ZilPay browserextensie

[![Chrome](https://img.shields.io/chrome-web-store/v/klnaejjgbibmhlephnhpmaofohgkpgkd)](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
[![FireFox](https://img.shields.io/amo/v/zilpay)](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Zilliqa/scilla/blob/master/LICENSE)
[![Gitter chat](http://img.shields.io/badge/chat-on%20gitter-077a8f.svg)](https://gitter.im/Zilliqa/General)

*Lees dit in andere talen: [English](README.md), [简体中文](README_ZH-CN.md), [Español](README_ES.md), [Русский](README_RU.md), [日本語](README_JP.md), [Deutsch](README_DE.md), [Korean](README_KR.md).*

ZilPay is een browserportemonnee voor Zilliqa blockchain. Ontwikkelaars kunnen ZilPay in hun website integreren om gedecentraliseerde apps te maken.

<p align="center">
  <a href="https://zilpay.xyz"><img src="https://github.com/lich666dead/zil-pay/blob/master/imgs/preview.png"></a>
</p>

## Links
+ [Discord](https://discordapp.com/channels/370992535725932544/636917110089580544)
+ [Chrome store](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
+ [FireFox store](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
+ [Opera](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)

## Ermee beginnen
U kunt de lokale versie implementeren vanuit de broncode.

Voor dApp-ontwikkelaars:
+ [ZilPay volledige documentatie](https://zilpay.xyz/Documentation/)
+ [ZilPay probeer je dApp te bouwen](https://medium.com/coinmonks/test-and-develop-dapps-on-zilliqa-with-zilpay-52b165f118bf?source=friends_link&sk=2a60070ddac60677ec36b1234c60222a)
+ [Zilliqa dApps-voorbeeld](https://github.com/lich666dead/zilliqa-dApps)

### installeren

```bash
$ npm install         # afhankelijkheden installeren
```

### Gebouw

* Voor ontwikkelen
```bash
$ npm run content     # build content.js
$ npm run inpage      # build inpage.js
$ npm run background  # build background.js
$ npm run scripts     # build content.js & inpage.js & background.js
$ npm run all:firefox # alle scripts gebouwd voor firefox-platform.
$ npm run all:chrome  # alle scripts gebouwd voor Chrome-platform.
```

* Voor productie:
```bash
$ npm run build:prod:firefox
$ npm run build:prod:chrome
```

### De tests uitvoeren
```bash
$ npm run test # testen uitvoeren
```

## Gebouwd met

* [webpack](https://github.com/webpack/webpack)
* [babel](https://github.com/babel/babel)
* [vuejs](https://github.com/vuejs)

## auteurs

* **Rinat Khasanshin** - *Eerste werkzaamheden* - [lich666black](https://github.com/lich666dead)

## Licentie

Dit project heeft een licentie onder de MIT-licentie - zie de [LICENSE.md](https://github.com/zilpay/zil-pay/blob/master/LICENSE) bestand voor details.

Bedankt voor het doneren.
------

- ZIL: zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace
- ETH: 0x246C5881E3F109B2aF170F5C773EF969d3da581B
- BTC: 12MRR8LyLVLHVqXcjz46c9o3KBS76fAY9r
- ZEC: t1dZMw8FVWnGKC9cyXKaiKWmmAFmQoeNc5Y
- LTC: LM3JwjTbboMkHdFEYnn4ycJB61r3fqvXPr
- DASH: Xv2tpCMHPAztd4B5UMnaqwkqnSfiUs1P8B
