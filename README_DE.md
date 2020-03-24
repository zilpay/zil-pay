# ZilPay Browser Erweiterung

[![Chrome](https://img.shields.io/chrome-web-store/v/klnaejjgbibmhlephnhpmaofohgkpgkd)](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
[![FireFox](https://img.shields.io/amo/v/zilpay)](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Zilliqa/scilla/blob/master/LICENSE)
[![Gitter chat](http://img.shields.io/badge/chat-on%20gitter-077a8f.svg)](https://gitter.im/Zilliqa/General)

*Lesen Sie dies in anderen Sprachen: [English](README.md), [简体中文](README_ZH-CN.md), [Español](README_ES.md), [Nederlands](intro_NL.md), [Русский](README_RU.md), [日本語](README_JP.md), [Korean](README_KR.md).*

ZilPay ist eine Browserbrieftasche für die Zilliqa-Blockchain. Entwickler können ZilPay in ihre Website integrieren, um dezentrale Apps zu erstellen.

<p align="center">
  <a href="https://zilpay.xyz"><img src="https://github.com/lich666dead/zil-pay/blob/master/imgs/preview.png"></a>
</p>

## Links
+ [Discord](https://discordapp.com/channels/370992535725932544/636917110089580544)
+ [Chrome store](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)
+ [FireFox store](https://addons.mozilla.org/en-GB/firefox/addon/zilpay/)
+ [Opera](https://chrome.google.com/webstore/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd?utm_source=chrome-ntp-icon)

## Beginnen
Sie können die lokale Version über den Quellcode bereitstellen.

Für dApp-Entwickler:
+ [ZilPay vollständige Dokumentation](https://zilpay.xyz/Documentation/)
+ [ZilPay versuchen Sie, Ihre dApp zu erstellen](https://medium.com/coinmonks/test-and-develop-dapps-on-zilliqa-with-zilpay-52b165f118bf?source=friends_link&sk=2a60070ddac60677ec36b1234c60222a)
+ [Zilliqa dApps Beispiel](https://github.com/lich666dead/zilliqa-dApps)

### Installieren

```bash
$ npm install         # Abhängigkeiten installieren
```

### Building

* For develop
```bash
$ npm run content     # build content.js
$ npm run inpage      # build inpage.js
$ npm run background  # build background.js
$ npm run scripts     # build content.js & inpage.js & background.js
$ npm run all:firefox # Alle Skripte wurden für die Firefox-Plattform erstellt.
$ npm run all:chrome  # Alle Skripte wurden für die Chrome-Plattform erstellt.
```

* Für die Produktion:
```bash
$ npm run build:prod:firefox
$ npm run build:prod:chrome
```

### Ausführen der Tests
```bash
$ npm run test # Führen Sie einen Test durch
```

## Gebaut mit

* [webpack](https://github.com/webpack/webpack)
* [babel](https://github.com/babel/babel)
* [vuejs](https://github.com/vuejs)

## Autoren

* **Rinat Khasanshin** - *Erste Arbeit* - [lich666black](https://github.com/lich666dead)

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE.md](https://github.com/zilpay/zil-pay/blob/master/LICENSE) Datei für Details.

Danke für deine Spende.
------

- ZIL: zil1wl38cwww2u3g8wzgutxlxtxwwc0rf7jf27zace
- ETH: 0x246C5881E3F109B2aF170F5C773EF969d3da581B
- BTC: 12MRR8LyLVLHVqXcjz46c9o3KBS76fAY9r
- ZEC: t1dZMw8FVWnGKC9cyXKaiKWmmAFmQoeNc5Y
- LTC: LM3JwjTbboMkHdFEYnn4ycJB61r3fqvXPr
- DASH: Xv2tpCMHPAztd4B5UMnaqwkqnSfiUs1P8B
